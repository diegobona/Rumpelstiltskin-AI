import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const state = vi.hoisted(() => ({ userId: 'owner', isAnonymous: false }));
vi.mock('@libs/auth/auth', () => ({
  auth: { api: { getSession: vi.fn(async () => state.userId ? { user: { id: state.userId, isAnonymous: state.isAnonymous } } : null) } },
}));
vi.mock('@libs/database', async () => {
  const { testDatabase } = await import('../../helpers/video-d1');
  return { ...testDatabase, getDialect: () => 'd1', isD1Dialect: () => true };
});
vi.mock('@libs/database/schema', () => import('../../../libs/database/schema/sqlite'));
vi.mock('@tanstack/react-router', () => ({ createFileRoute: () => (options: unknown) => options }));
vi.mock('@/lib/with-request-db', () => ({ withCfDb: (handler: unknown) => handler }));
vi.mock('@/lib/video-visitor', () => import('../../../apps/tanstack-app/src/lib/video-visitor'));

import { creditService } from '@libs/credits';
import { resetVideoDatabase, testDatabase } from '../../helpers/video-d1';
import { Route as generateRoute } from '../../../apps/tanstack-app/src/routes/api/video-generate/index';
import { Route as statusRoute } from '../../../apps/tanstack-app/src/routes/api/video-generate/status';
import { videoVisitor } from '../../../apps/tanstack-app/src/lib/video-visitor';
let cookie = '';

const POST = (request: Request): Promise<Response> => (generateRoute as any).server.handlers.POST({ request });
const GET = (request: Request): Promise<Response> => (statusRoute as any).server.handlers.GET({ request });

function createRequest(input?: Record<string, unknown>) {
  return new Request('https://app.example/api/video-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(input ?? {
      provider: 'autodl', model: 'minimax-h3', prompt: 'The person performs a playful dance',
      firstFrameUrl: 'https://media.example/person.webp', duration: 10, size: '768p竖',
    }),
  });
}

function taskStatusRequest(taskId: string) {
  return new Request(`https://app.example/api/video-generate/status?taskId=${taskId}`);
}

describe('AutoDL uses the existing authenticated video credit lifecycle', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    state.userId = 'owner';
    state.isAnonymous = false;
    resetVideoDatabase();
    vi.spyOn(creditService, 'consumeCredits');
    vi.spyOn(creditService, 'addCredits');
    vi.stubEnv('AUTODL_API_KEY', 'test-raw-token');
    vi.stubEnv('R2_PUBLIC_URL', 'https://test-images.example.test');
    vi.stubEnv('BETTER_AUTH_SECRET', 'test-secret-with-at-least-thirty-two-characters');
    cookie = (await videoVisitor(new Request('https://app.example/'))).cookie!.split(';')[0];
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test('requires a session and configured credentials before charging', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    state.userId = '';
    expect((await POST(createRequest())).status).toBe(401);
    state.userId = 'owner';
    vi.stubEnv('AUTODL_API_KEY', '');
    expect((await POST(createRequest())).status).toBe(400);
    expect(creditService.consumeCredits).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('refunds 40 credits if upstream task creation fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));
    expect((await POST(createRequest())).status).toBe(500);
    expect(creditService.consumeCredits).toHaveBeenCalledWith(expect.objectContaining({ amount: 40 }));
    expect(creditService.addCredits).toHaveBeenCalledWith(expect.objectContaining({ amount: 40, type: 'refund' }));
    expect(await creditService.getBalance('owner')).toBe(80);
    expect(testDatabase.sqlite.prepare("SELECT COUNT(*) AS count FROM video_trial WHERE state <> 'available'").get()).toEqual({ count: 0 });
  });

  test('refunds terminal task failure once across repeated status requests', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'Success', data: { task_id: 'remote-failure', status: 'QUEUED' } })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'Success', data: { task_id: 'remote-failure', status: 'FAILED', message: 'Generation failed' } })));
    vi.stubGlobal('fetch', fetch);
    const created = await (await POST(createRequest())).json();
    expect(created.credits).toMatchObject({ consumed: 40, remaining: 40 });
    const failed = await (await GET(taskStatusRequest(created.data.taskId))).json();
    expect(failed.data).toMatchObject({ status: 'failed', error: 'Generation failed' });
    await GET(taskStatusRequest(created.data.taskId));
    expect(await creditService.getTransactions('owner', { type: 'refund' })).toHaveLength(1);
    expect(await creditService.getBalance('owner')).toBe(80);
    expect(testDatabase.sqlite.prepare("SELECT COUNT(*) AS count FROM video_trial WHERE state <> 'available'").get()).toEqual({ count: 0 });
  });

  test('restricts task ownership and returns a completed video without a refund', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'Success', data: { task_id: 'remote-success', status: 'QUEUED' } })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'Success', data: { status: 'completed', results: [{ type: 'video', file_type: 'mp4', url: 'https://media.example/dance.mp4' }] } })));
    vi.stubGlobal('fetch', fetch);
    const created = await (await POST(createRequest())).json();
    state.userId = 'different-user';
    expect((await GET(taskStatusRequest(created.data.taskId))).status).toBe(404);
    expect(fetch).toHaveBeenCalledTimes(1);
    state.userId = 'owner';
    const completed = await (await GET(taskStatusRequest(created.data.taskId))).json();
    expect(completed.data).toMatchObject({ status: 'succeeded', result: { provider: 'autodl', videoUrl: 'https://media.example/dance.mp4' } });
    expect(creditService.addCredits).not.toHaveBeenCalled();
    expect(await creditService.getBalance('owner')).toBe(40);
    expect((await POST(createRequest())).status).toBe(403);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('a guest can submit only the fixed dance template and parallel requests start one job', async () => {
    state.isAnonymous = true;
    const fetch = vi.fn(async () => new Response(JSON.stringify({ code: 'Success', data: { task_id: 'guest-job', status: 'QUEUED' } })));
    vi.stubGlobal('fetch', fetch);
    expect((await POST(createRequest())).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
    const responses = await Promise.all(Array.from({ length: 8 }, () => POST(createRequest({
      danceTemplate: 'rumpelstiltskin-v2', dancerImageUrl: 'https://photos.example.test/dancer.jpg',
    }))));
    expect(responses.filter(response => response.status === 200)).toHaveLength(1);
    expect(await Promise.all(responses.filter(response => response.status !== 200).map(async response => ({ status: response.status, body: await response.json() }))))
      .toEqual(Array.from({ length: 7 }, () => ({ status: 409, body: { error: 'trial_processing' } })));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(creditService.consumeCredits).toHaveBeenCalledTimes(1);
  });

  test('simultaneous status polls cannot duplicate a failed generation refund', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'Success', data: { task_id: 'concurrent-failure', status: 'QUEUED' } })))
      .mockImplementation(async () => new Response(JSON.stringify({ code: 'Success', data: { status: 'FAILED', message: 'Generation failed' } }))));
    const created = await (await POST(createRequest())).json();
    const { refreshVideoTask } = await import('../../../libs/ai/video-task-status');
    const tasks = await Promise.all(Array.from({ length: 8 }, () => refreshVideoTask(created.data.taskId, 'owner')));
    expect(tasks.map((task) => task?.status)).toEqual(Array(8).fill('failed'));
    expect(await creditService.getBalance('owner')).toBe(80);
    expect(await creditService.getTransactions('owner', { type: 'refund' })).toHaveLength(1);
  });

  test('a failed refund remains recoverable on the next status request', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'Success', data: { task_id: 'retry-refund', status: 'QUEUED' } })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'Success', data: { status: 'FAILED', message: 'Generation failed' } })));
    vi.stubGlobal('fetch', fetch);
    const created = await (await POST(createRequest())).json();
    testDatabase.sqlite.exec("CREATE TRIGGER reject_refund BEFORE INSERT ON credit_transaction WHEN NEW.type = 'refund' BEGIN SELECT RAISE(ABORT, 'test refund failure'); END;");
    expect((await GET(taskStatusRequest(created.data.taskId))).status).toBe(500);
    expect(await creditService.getBalance('owner')).toBe(40);
    testDatabase.sqlite.exec('DROP TRIGGER reject_refund');
    const retried = await (await GET(taskStatusRequest(created.data.taskId))).json();
    expect(retried.data.status).toBe('failed');
    expect(retried.credits.remaining).toBe(80);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
