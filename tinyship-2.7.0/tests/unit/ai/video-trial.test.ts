import { beforeEach, describe, expect, test, vi } from 'vitest';
vi.mock('@libs/database', async () => { const { testDatabase } = await import('../../helpers/video-d1'); return { ...testDatabase, getDialect: () => 'd1' }; });
vi.mock('@libs/database/schema', () => import('../../../libs/database/schema/sqlite'));
import { resetVideoDatabase, testDatabase } from '../../helpers/video-d1';
import { attachTrialTask, finishVideoTrial, getVideoTrial, inheritTrialUsage, releaseVideoTrial, reserveVideoTrial, takeTrialRateSlot, trialKeys } from '../../../libs/ai/video-trial';
import { limitTrialIp, readVideoVisitor, videoVisitor } from '../../../apps/tanstack-app/src/lib/video-visitor';

describe('one successful browser/account video', () => {
  beforeEach(() => { resetVideoDatabase(); vi.stubEnv('BETTER_AUTH_SECRET', 'a-test-secret-of-at-least-thirty-two-characters'); });
  test('twenty parallel submissions obtain only one complete reservation', async () => {
    const keys = trialKeys('browser-a', 'owner');
    const results = await Promise.allSettled(Array.from({ length: 20 }, () => reserveVideoTrial(keys, 'owner')));
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    const rows = testDatabase.sqlite.prepare('SELECT * FROM video_trial').all() as { reservation_id: string; state: string }[];
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map(r => r.reservation_id)).size).toBe(1);
    expect(await getVideoTrial(keys)).toMatchObject({ state: 'processing' });
  });
  test('success blocks another account on this browser and this account on another browser', async () => {
    const id = await reserveVideoTrial(trialKeys('browser-a', 'owner'), 'owner');
    await attachTrialTask(id, 'job'); await finishVideoTrial('job', 'succeeded');
    await expect(reserveVideoTrial(trialKeys('browser-a', 'different-user'), 'different-user')).rejects.toMatchObject({ code: 'trial_used' });
    await expect(reserveVideoTrial(trialKeys('browser-b', 'owner'), 'owner')).rejects.toMatchObject({ code: 'trial_used' });
  });
  test('failure releases both scopes and duplicate late failure cannot undo success', async () => {
    const keys = trialKeys('browser-a', 'owner');
    const id = await reserveVideoTrial(keys, 'owner'); await attachTrialTask(id, 'failed-job');
    await finishVideoTrial('failed-job', 'failed');
    expect(await getVideoTrial(keys)).toMatchObject({ state: 'available' });
    const retry = await reserveVideoTrial(keys, 'owner'); await attachTrialTask(retry, 'success-job');
    await finishVideoTrial('success-job', 'succeeded'); await finishVideoTrial('success-job', 'failed'); await releaseVideoTrial(retry);
    expect(await getVideoTrial(keys)).toMatchObject({ state: 'used' });
  });
  test('registering after guest use does not provide another allowance', async () => {
    const id = await reserveVideoTrial(trialKeys('browser-a', 'owner'), 'owner');
    await attachTrialTask(id, 'job'); await finishVideoTrial('job', 'succeeded');
    await inheritTrialUsage(trialKeys('browser-a', 'different-user'));
    await expect(reserveVideoTrial(trialKeys('brand-new-browser', 'different-user'), 'different-user')).rejects.toMatchObject({ code: 'trial_used' });
  });
  test('durable IP counter does not allow parallel requests beyond the configured cap', async () => {
    const results = await Promise.allSettled(Array.from({ length: 15 }, () => takeTrialRateSlot('hashed-ip-window', 5, new Date(Date.now() + 3600000))));
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(5);
  });
  test('visitor cookie is persistent, HttpOnly, secure on HTTPS, and rejects tampering', async () => {
    const created = await videoVisitor(new Request('https://app.example/'));
    expect(created.cookie).toContain('HttpOnly; SameSite=Lax; Max-Age=31536000; Secure');
    const cookie = created.cookie!.split(';')[0];
    expect(await readVideoVisitor(new Request('https://app.example/', { headers: { cookie } }))).toBe(created.id);
    expect(await readVideoVisitor(new Request('https://app.example/', { headers: { cookie: cookie.replace(created.id, crypto.randomUUID()) } }))).toBeNull();
    expect((await videoVisitor(new Request('http://localhost/'))).cookie).not.toContain('; Secure');
  });
  test('IP guard trusts only Cloudflare request context and limits a trusted address', async () => {
    for (let i = 0; i < 8; i++) await limitTrialIp(new Request('https://app.example/', { headers: { 'cf-connecting-ip': '192.0.2.1', 'x-forwarded-for': '192.0.2.2' } }), 'generate');
    expect(testDatabase.sqlite.prepare('SELECT COUNT(*) AS count FROM video_trial_rate').get()).toEqual({ count: 0 });
    const request = new Request('https://app.example/', { headers: { 'cf-connecting-ip': '192.0.2.1' } });
    Object.defineProperty(request, 'cf', { value: {} });
    for (let i = 0; i < 5; i++) await limitTrialIp(request, 'generate');
    await expect(limitTrialIp(request, 'generate')).rejects.toMatchObject({ code: 'rate_limited', status: 429 });
    const rows = testDatabase.sqlite.prepare('SELECT key FROM video_trial_rate').all();
    expect(JSON.stringify(rows)).not.toContain('192.0.2.1');
  });
});
