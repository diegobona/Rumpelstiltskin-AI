import { describe, expect, test } from 'vitest'
import { readDanceTask, rememberDanceTask } from '../../../apps/tanstack-app/src/lib/dance-task-session'

function storage() {
  const values = new Map<string, string>()
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) }, removeItem: (key: string) => { values.delete(key) } }
}

describe('tab task recovery', () => {
  test('recovers an existing job only for its signed-in owner', () => {
    const state = storage()
    rememberDanceTask(state, 'alice', 'task-123', 100)
    expect(readDanceTask(state, 'alice', 101)).toBe('task-123')
    expect(readDanceTask(state, 'bob', 101)).toBeNull()
  })
  test('does not revive expired or malformed browser records', () => {
    const state = storage()
    rememberDanceTask(state, 'alice', 'task-123', 100)
    expect(readDanceTask(state, 'alice', 100 + 24 * 60 * 60 * 1000)).toBeNull()
    state.setItem('rumpelstiltskin:last-task:alice', '{bad')
    expect(readDanceTask(state, 'alice', 101)).toBeNull()
  })
  test('unavailable browser storage does not break generation', () => {
    const state = { getItem: () => { throw new Error('disabled') }, setItem: () => { throw new Error('disabled') }, removeItem: () => { throw new Error('disabled') } }
    expect(() => rememberDanceTask(state, 'alice', 'task-123')).not.toThrow()
    expect(readDanceTask(state, 'alice')).toBeNull()
  })
})
