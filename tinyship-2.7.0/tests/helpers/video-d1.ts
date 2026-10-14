import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/d1';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import * as schema from '../../libs/database/schema/sqlite';

// Executes the real migration and D1 SQL against SQLite, with D1's atomic batch
// contract. No provider network calls or application databases are used.
const sqlite = new Database(':memory:');
sqlite.pragma('foreign_keys = ON');
const migrations = resolve('libs/database/drizzle-sqlite');
for (const file of readdirSync(migrations).filter((name) => name.endsWith('.sql')).sort()) {
  sqlite.exec(readFileSync(resolve(migrations, file), 'utf8'));
}

function prepare(query: string, params: unknown[] = []) {
  const execute = () => {
    const statement = sqlite.prepare(query);
    const results = statement.reader ? statement.all(...params) : (statement.run(...params), []);
    return { success: true, results, meta: { changes: (sqlite.prepare('SELECT changes() AS count').get() as { count: number }).count } };
  };
  return {
    bind: (...values: unknown[]) => prepare(query, values),
    raw: async () => sqlite.prepare(query).raw().all(...params),
    all: async () => execute(),
    run: async () => execute(),
    execute,
  };
}

const binding = {
  prepare,
  batch: async (statements: ReturnType<typeof prepare>[]) => sqlite.transaction(() => statements.map((statement) => statement.execute()))(),
};
const db = drizzle(binding as never, { schema });
const runNativeD1Batch = (statements: { sql: string; params?: unknown[] }[]) =>
  binding.batch(statements.map(({ sql, params = [] }) => prepare(sql, params)));

export const testDatabase = { sqlite, db, runNativeD1Batch, runD1Batch: db.batch.bind(db) };

export function resetVideoDatabase(balance = 80) {
  sqlite.exec('DROP TRIGGER IF EXISTS reject_refund; DELETE FROM video_trial; DELETE FROM video_trial_rate; DELETE FROM user;');
  const now = Math.floor(Date.now() / 1000);
  sqlite.prepare('INSERT INTO user (id, email, email_verified, credit_balance, created_at, updated_at) VALUES (?, ?, 1, ?, ?, ?)')
    .run('owner', 'owner@example.test', String(balance), now, now);
  sqlite.prepare('INSERT INTO user (id, email, email_verified, credit_balance, created_at, updated_at) VALUES (?, ?, 1, ?, ?, ?)')
    .run('different-user', 'other@example.test', '80', now, now);
}
