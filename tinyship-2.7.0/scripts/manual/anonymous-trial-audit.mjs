// Local-only integration check. Uses real Better Auth and local D1; a seeded
// completed job replaces AutoDL, and browser requests never upload to R2.
import { chromium, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'

const require = createRequire(import.meta.url)
const root = fileURLToPath(new URL('../../', import.meta.url))
const app = path.join(root, 'apps/tanstack-app')
const wrangler = path.join(path.dirname(require.resolve('wrangler/package.json')), 'bin/wrangler.js')
const base = 'http://127.0.0.1:7002'
const output = path.join(root, 'test-results/anonymous-trial')
const fixtureId = `guest-audit-${crypto.randomUUID()}`
const email = `${fixtureId}@example.com`
const password = `Audit-${crypto.randomUUID()}`
const accountIds = new Set()
const browserKeys = new Set()
const report = { checks: [], errors: [], realUploads: 0, paidJobs: 0 }
const quote = value => `'${String(value).replaceAll("'", "''")}'`
function localSql(sql) {
  // Always --local and the verified app config. No cloud mutation.
  return JSON.parse(execFileSync(process.execPath, [wrangler, 'd1', 'execute', 'DB', '--local', '--config', 'wrangler.jsonc', '--command', sql, '--json'], { cwd: app, encoding: 'utf8', windowsHide: true }))
}
const browser = await chromium.launch({ channel: 'msedge' })
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } })
const page = await context.newPage()
page.on('pageerror', error => report.errors.push(error.message))
await page.route('**/guest-audit-empty.mp4', route => route.fulfill({ status: 204, contentType: 'video/mp4', body: '' }))
await mkdir(output, { recursive: true })
const getTrial = async ctx => {
  const response = await ctx.request.get(base + '/api/video-generate/')
  assert.equal(response.status(), 200)
  const data = (await response.json()).data
  browserKeys.add(`browser:${data.storageKey}`)
  return data
}
try {
  await page.goto(base)
  await expect(page.getByRole('button', { name: 'Choose dancer photo', exact: true })).toBeEnabled()
  assert.equal((await getTrial(context)).state, 'available')
  const anonymous = await context.request.post(base + '/api/auth/sign-in/anonymous', { headers: { Origin: base }, data: {} })
  assert.equal(anonymous.status(), 200)
  const guest = (await (await context.request.get(base + '/api/auth/get-session')).json()).user
  assert.equal(guest.isAnonymous, true)
  accountIds.add(guest.id)
  assert.equal((await (await context.request.get(base + '/api/credits/balance')).json()).balance, 40)
  report.checks.push('Guest session and trial credits are created without an email, password or signup screen')

  const forbidden = await context.request.post(base + '/api/image-generate', { headers: { Origin: base }, data: {} })
  assert.equal(forbidden.status(), 401)
  report.checks.push('Guest session cannot spend trial credits on unrelated AI endpoints')

  const now = Math.floor(Date.now() / 1000)
  const trial = await getTrial(context)
  const result = { provider: 'autodl', model: 'minimax_h3_lightx2v_v5', videoUrl: `${base}/guest-audit-empty.mp4`, duration: 10 }
  localSql(`INSERT INTO video_task (id,user_id,provider,model,provider_task_id,credit_cost,status,result,created_at,updated_at)
    VALUES (${quote(fixtureId)},${quote(guest.id)},'autodl','minimax_h3_lightx2v_v5',${quote(fixtureId)},0,'succeeded',${quote(JSON.stringify(result))},${now},${now});
    UPDATE video_trial SET state='used',reservation_id=${quote(fixtureId)},task_id=${quote(fixtureId)} WHERE key IN (${quote(`browser:${trial.storageKey}`)},${quote(`user:${guest.id}`)});`)
  assert.equal((await getTrial(context)).state, 'used')
  const submit = () => context.request.post(base + '/api/video-generate/', { headers: { Origin: base }, data: { danceTemplate: 'rumpelstiltskin-v2', dancerImageUrl: 'https://photos.example.test/dancer.png' } })
  const blocked = await submit()
  assert.equal(blocked.status(), 403)
  assert.equal((await blocked.json()).error, 'trial_used')
  report.checks.push('Real generation API refuses a used guest allowance before calling AutoDL')

  await page.goto(base + '/signup?returnTo=%2F')
  await page.locator('#name').fill('Guest Audit')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await expect(page).toHaveURL(base + '/', { timeout: 20000 })
  const registered = (await (await context.request.get(base + '/api/auth/get-session')).json()).user
  assert.equal(registered.email, email)
  assert.equal(registered.isAnonymous, false)
  accountIds.add(registered.id)
  assert.equal((await getTrial(context)).state, 'used')
  const status = await context.request.get(base + '/api/video-generate/status?taskId=' + fixtureId)
  assert.equal(status.status(), 200)
  assert.equal((await status.json()).data.status, 'succeeded')
  await expect(page.getByRole('button', { name: 'Generate video', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Download video', exact: true })).toBeEnabled()
  await page.screenshot({ path: path.join(output, 'registered-used-trial.png'), fullPage: true })
  report.checks.push('Real UI signup transfers the guest task, keeps download access, and preserves the used allowance')

  const fresh = await browser.newContext()
  assert.equal((await getTrial(fresh)).state, 'available')
  const signIn = await fresh.request.post(base + '/api/auth/sign-in/email', { headers: { Origin: base }, data: { email, password } })
  assert.equal(signIn.status(), 200)
  assert.equal((await getTrial(fresh)).state, 'used')
  await fresh.close()
  report.checks.push('Signing in from a fresh browser cannot reset the account allowance')

  await context.request.post(base + '/api/auth/sign-out', { headers: { Origin: base }, data: {} })
  assert.equal((await getTrial(context)).state, 'used')
  const anotherGuest = await context.request.post(base + '/api/auth/sign-in/anonymous', { headers: { Origin: base }, data: {} })
  assert.equal(anotherGuest.status(), 403)
  report.checks.push('Signing out cannot obtain another guest allowance on the same browser')
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.passed = false
  report.failure = String(error)
  await page.screenshot({ path: path.join(output, 'failure.png'), fullPage: true })
  process.exitCode = 1
} finally {
  // Exact IDs generated by this run only; quota rows intentionally survive user
  // deletion in production, so the local audit must explicitly remove its own.
  if (accountIds.size) {
    const userList = [...accountIds].map(quote).join(',')
    const keys = [...browserKeys, ...[...accountIds].map(id => `user:${id}`)].map(quote).join(',')
    localSql(`DELETE FROM video_trial WHERE key IN (${keys}); DELETE FROM user WHERE id IN (${userList});`)
  }
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
}
