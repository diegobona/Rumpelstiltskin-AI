import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@libs/database', async () => {
  const { testDatabase } = await import('../../helpers/video-d1');
  return { ...testDatabase, getDialect: () => 'd1', isD1Dialect: () => true };
});
vi.mock('@libs/database/schema', () => import('../../../libs/database/schema/sqlite'));

import { testDatabase, resetVideoDatabase } from '../../helpers/video-d1';
import { creditService } from '../../../libs/credits';
import * as store from '../../../libs/ai/video-task-store';

const result = { provider: 'autodl' as const, model: 'minimax-h3', videoUrl: 'https://media.example/result.mp4', duration: 10 };

async function chargedTask() {
  const consumed = await creditService.consumeCredits({ userId: 'owner', amount: 40 });
  expect(consumed.success).toBe(true);
  return store.createVideoTaskRecord({ userId: 'owner', provider: 'autodl', model: 'minimax-h3', providerTaskId: crypto.randomUUID(), creditCost: 40, consumeTransactionId: consumed.transactionId });
}

describe('durable video task state and D1 refunds', () => {
  beforeEach(() => resetVideoDatabase());

  test('another module instance reads the provider id, charge and completed result', async () => {
    const task = await chargedTask();
    vi.resetModules();
    const anotherWorker = await import('../../../libs/ai/video-task-store');
    expect(await anotherWorker.getVideoTaskRecord(task.id, 'owner')).toMatchObject({ providerTaskId: task.providerTaskId, consumeTransactionId: task.consumeTransactionId, status: 'processing' });
    await anotherWorker.markVideoTaskSucceeded(task.id, 'owner', result);
    expect(await store.getVideoTaskRecord(task.id, 'owner')).toMatchObject({ status: 'succeeded', result });
  });

  test('cannot read, transition or refund another user’s task', async () => {
    const task = await chargedTask();
    expect(await store.getVideoTaskRecord(task.id, 'different-user')).toBeUndefined();
    expect(await store.markVideoTaskFailed(task.id, 'different-user', 'unauthorized')).toBeUndefined();
    expect(await store.markVideoTaskSucceeded(task.id, 'different-user', result)).toBeUndefined();
    expect(await store.refundFailedVideoTask(task.id, 'different-user')).toBeUndefined();
    expect((await store.getVideoTaskRecord(task.id, 'owner'))?.status).toBe('processing');
    expect(await creditService.getBalance('owner')).toBe(40);
  });

  test('concurrent repeated failed polls return credits exactly once', async () => {
    const task = await chargedTask();
    await store.markVideoTaskFailed(task.id, 'owner', 'Provider rejected the generation');
    await Promise.all(Array.from({ length: 20 }, () => store.refundFailedVideoTask(task.id, 'owner')));
    expect(await creditService.getBalance('owner')).toBe(80);
    const refunds = await creditService.getTransactions('owner', { type: 'refund' });
    expect(refunds).toHaveLength(1);
    expect(refunds[0].metadata).toMatchObject({ originalTransactionId: task.consumeTransactionId, videoTaskId: task.id });
    expect((await store.getVideoTaskRecord(task.id, 'owner'))?.refunded).toBe(true);
  });

  test('ledger failure rolls back balance and refund flag; a later instance retries safely', async () => {
    const task = await chargedTask();
    await store.markVideoTaskFailed(task.id, 'owner', 'Failed');
    testDatabase.sqlite.exec("CREATE TRIGGER reject_refund BEFORE INSERT ON credit_transaction WHEN NEW.type = 'refund' BEGIN SELECT RAISE(ABORT, 'test ledger unavailable'); END;");
    await expect(store.refundFailedVideoTask(task.id, 'owner')).rejects.toThrow('test ledger unavailable');
    expect(await creditService.getBalance('owner')).toBe(40);
    expect((await store.getVideoTaskRecord(task.id, 'owner'))?.refunded).toBe(false);
    testDatabase.sqlite.exec('DROP TRIGGER reject_refund');
    vi.resetModules();
    const anotherWorker = await import('../../../libs/ai/video-task-store');
    await anotherWorker.refundFailedVideoTask(task.id, 'owner');
    expect(await creditService.getBalance('owner')).toBe(80);
  });

  test('late failure cannot overwrite success or refund a completed video', async () => {
    const task = await chargedTask();
    await store.markVideoTaskSucceeded(task.id, 'owner', result);
    await store.markVideoTaskFailed(task.id, 'owner', 'Late response');
    await store.refundFailedVideoTask(task.id, 'owner');
    expect(await store.getVideoTaskRecord(task.id, 'owner')).toMatchObject({ status: 'succeeded', result, refunded: false });
    expect(await creditService.getBalance('owner')).toBe(40);
  });

  test('late success cannot revive a failed and refunded task', async () => {
    const task = await chargedTask();
    await store.markVideoTaskFailed(task.id, 'owner', 'Failed');
    await store.refundFailedVideoTask(task.id, 'owner');
    await store.markVideoTaskSucceeded(task.id, 'owner', result);
    expect(await store.getVideoTaskRecord(task.id, 'owner')).toMatchObject({ status: 'failed', refunded: true });
  });

  test('a charge cannot be attached to multiple jobs or to a different user', async () => {
    const task = await chargedTask();
    await expect(store.createVideoTaskRecord({ ...task, userId: 'different-user', providerTaskId: 'stolen' })).rejects.toThrow('original credit consumption');
    await expect(store.createVideoTaskRecord({ ...task, providerTaskId: 'duplicate-charge' })).rejects.toThrow();
  });

  test('numeric balances such as 100 are sufficient for a 40-credit generation', async () => {
    resetVideoDatabase(100);
    await chargedTask();
    expect(await creditService.getBalance('owner')).toBe(60);
  });

  test('a single-digit balance cannot overdraw a 40-credit charge', async () => {
    resetVideoDatabase(9);
    expect((await creditService.consumeCredits({ userId: 'owner', amount: 40 })).success).toBe(false);
    expect(await creditService.getBalance('owner')).toBe(9);
    expect(await creditService.getTransactions('owner')).toHaveLength(0);
  });
});
