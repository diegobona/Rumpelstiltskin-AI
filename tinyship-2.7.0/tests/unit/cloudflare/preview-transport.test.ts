import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

test('preview outbound preserves WebSocket upgrades and bidirectional messages', () => {
  // Real local Miniflare + WebSocket server; no Cloudflare account or API keys.
  const script = String.raw`
    const { createRequire } = require('node:module');
    const { once } = require('node:events');
    require(process.argv[1]);
    const wranglerRequire = createRequire(require.resolve('wrangler'));
    const miniflarePath = wranglerRequire.resolve('miniflare');
    const { Miniflare } = wranglerRequire('miniflare');
    const { WebSocketServer } = createRequire(miniflarePath)('ws');
    (async () => {
      const server = new WebSocketServer({ port: 0, host: '127.0.0.1' });
      await once(server, 'listening');
      server.on('connection', socket => socket.on('message', bytes => socket.send(bytes.toString())));
      const endpoint = 'http://127.0.0.1:' + server.address().port;
      const worker = new Miniflare({ name: 'rumpelstiltskin-ai', modules: true,
        script: 'export default { fetch() { return fetch(' + JSON.stringify(endpoint) + ', { headers: { Upgrade: "websocket" } }); } }' });
      try {
        const response = await worker.dispatchFetch('http://localhost', { headers: { Upgrade: 'websocket' } });
        if (response.status !== 101 || !response.webSocket) throw new Error('Expected WebSocket upgrade, got ' + response.status);
        const ws = response.webSocket;
        ws.accept();
        const message = new Promise(resolve => ws.addEventListener('message', event => resolve(event.data), { once: true }));
        ws.send('remote-r2-tunnel-probe');
        if (await message !== 'remote-r2-tunnel-probe') throw new Error('WebSocket payload lost');
        ws.close();
        process.stdout.write('websocket-roundtrip-ok');
      } finally { for (const client of server.clients) client.terminate(); await worker.dispose(); server.close(); }
    })().catch(error => { console.error(error); process.exitCode = 1; });
  `;
  const output = execFileSync(process.execPath, ['-e', script, resolve('apps/tanstack-app/scripts/cloudflare-proxy.cjs')], { encoding: 'utf8', timeout: 25000, windowsHide: true });
  expect(output).toContain('websocket-roundtrip-ok');
}, 30000);
