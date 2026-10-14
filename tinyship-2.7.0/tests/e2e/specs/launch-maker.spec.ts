import { expect, test } from '@playwright/test'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const dancer = path.resolve('apps/tanstack-app/public/images/dance/example-barn.png')
const videoUrl = 'https://video.example.test/dance.mp4'
const trial = { state: 'available', taskId: null, storageKey: 'launch-visitor' }
const trialResponse = (route: import('@playwright/test').Route) => route.fulfill({ json: { success: true, data: trial } })

async function signedIn(page: import('@playwright/test').Page) {
  await page.route('**/api/video-generate/', route => route.request().method() === 'GET' ? trialResponse(route) : route.abort())
  await page.route('**/api/auth/get-session**', route => route.fulfill({ json: {
    user: { id: 'launch-user', name: 'Visitor', email: 'visitor@example.com', emailVerified: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    session: { id: 'launch-session', userId: 'launch-user', token: 'local-test-only', expiresAt: new Date(Date.now() + 86400000).toISOString() },
  } }))
  await page.route('**/api/credits/balance', route => route.fulfill({ json: { balance: 40 } }))
  await page.route('**/api/upload**', route => route.fulfill({ json: { success: true, data: { url: 'https://photos.example.test/dancer.png' } } }))
  await page.route(videoUrl, route => route.fulfill({ status: 204, contentType: 'video/mp4', body: '' }))
}

test('a visitor generates without signing in and cannot start a second video', async ({ page }) => {
  let jobs = 0
  await page.route('**/api/upload**', route => route.fulfill({ json: { success: true, data: { url: 'https://photos.example.test/dancer.png' } } }))
  await page.route('**/api/video-generate/', route => {
    if (route.request().method() === 'GET') return route.continue()
    jobs += 1
    return route.fulfill({ json: { success: true, data: { videoUrl, provider: 'autodl', model: 'minimax_h3_lightx2v_v5', duration: 10 } } })
  })
  await page.route(videoUrl, route => route.fulfill({ status: 204, contentType: 'video/mp4', body: '' }))
  await page.goto('/')
  const maker = page.getByTestId('dance-maker')
  await expect(maker.getByRole('button', { name: 'Choose dancer photo', exact: true })).toBeEnabled()
  await page.locator('input[type=file]').first().setInputFiles(dancer)
  await page.getByRole('checkbox', { name: 'I have permission to use the photos I upload.' }).check()
  await maker.getByRole('button', { name: 'Generate video', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Your video is ready.' })).toBeVisible()
  expect((await (await page.request.get('/api/auth/get-session')).json()).user.isAnonymous).toBe(true)
  await expect(page).toHaveURL(/\/$/)
  await expect(maker.getByRole('button', { name: 'Generate video', exact: true })).toBeDisabled()
  expect(jobs).toBe(1)
})

test('refresh recovers the current task without uploading or charging twice', async ({ page }) => {
  await signedIn(page)
  let posts = 0
  let completed = false
  await page.route('**/api/video-generate/', route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { success: true, data: { ...trial, state: posts ? 'processing' : 'available', taskId: posts ? 'resume-job' : null } } })
    posts += 1
    return route.fulfill({ json: { success: true, data: { status: 'processing', taskId: 'resume-job' } } })
  })
  await page.route('**/api/video-generate/status?*', route => route.fulfill({ json: { success: true, data: completed
    ? { status: 'succeeded', result: { videoUrl, provider: 'autodl', model: 'minimax_h3_lightx2v_v5', duration: 10 } }
    : { status: 'processing' } } }))
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Choose dancer photo', exact: true })).toBeEnabled()
  await page.locator('input[type=file]').first().setInputFiles(dancer)
  await page.getByRole('checkbox', { name: 'I have permission to use the photos I upload.' }).check()
  await page.getByRole('button', { name: 'Generate video', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Generating your dance video' })).toBeVisible()
  completed = true
  await page.reload()
  await expect(page.getByRole('status').filter({ hasText: 'Your video is ready.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Download video', exact: true })).toBeEnabled()
  expect(posts).toBe(1)
})

test('an expired saved task offers recovery without trapping the user in a status loop', async ({ page }) => {
  await signedIn(page)
  await page.addInitScript(() => sessionStorage.setItem('rumpelstiltskin:last-task:launch-visitor', JSON.stringify({ taskId: 'expired-job', savedAt: Date.now() })))
  await page.route('**/api/video-generate/status?*', route => route.fulfill({ status: 404, json: { error: 'Not found' } }))
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('no longer available')
  await expect(page.getByRole('button', { name: 'Choose dancer photo', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Check video status', exact: true })).toHaveCount(0)
})

test('a temporary status error can be retried without reselecting photos', async ({ page }) => {
  await signedIn(page)
  await page.addInitScript(() => sessionStorage.setItem('rumpelstiltskin:last-task:launch-visitor', JSON.stringify({ taskId: 'retry-job', savedAt: Date.now() })))
  let succeeded = false
  let newJobs = 0
  await page.route('**/api/video-generate/', route => { if (route.request().method() === 'GET') return trialResponse(route); newJobs += 1; return route.abort() })
  await page.route('**/api/video-generate/status?*', route => succeeded
    ? route.fulfill({ json: { success: true, data: { status: 'succeeded', result: { videoUrl, provider: 'autodl', model: 'minimax_h3_lightx2v_v5' } } } })
    : route.fulfill({ status: 503, json: { error: 'temporary' } }))
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Check video status', exact: true })).toBeEnabled()
  succeeded = true
  await page.getByRole('button', { name: 'Check video status', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Your video is ready.' })).toBeVisible()
  expect(newJobs).toBe(0)
})

test('photo validation, optional princess reset, playback and download work together', async ({ page }) => {
  await signedIn(page)
  // Reuse a private, previously generated local test clip; never publish or regenerate it.
  const clip = path.resolve('artifacts/private/videos/rumpelstiltskin-ai-portrait-five-shot.mp4')
  await page.route(videoUrl, route => route.fulfill({ path: clip, contentType: 'video/mp4' }))
  await page.route('**/api/video-generate/download', route => route.fulfill({ path: clip, contentType: 'video/mp4' }))
  await page.route('**/api/video-generate/', route => route.request().method() === 'GET' ? trialResponse(route) : route.fulfill({ json: { success: true, data: {
    videoUrl, provider: 'autodl', model: 'minimax_h3_lightx2v_v5', duration: 10,
  } } }))
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Choose dancer photo', exact: true })).toBeEnabled()
  const files = page.locator('input[type=file]')
  await files.first().setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('not a photo') })
  await expect(page.getByRole('alert')).toHaveText('Choose a JPG, PNG, or WebP image.')
  await files.first().setInputFiles(dancer)
  await files.nth(1).setInputFiles(dancer)
  await expect(page.getByAltText('Preview of your selected princess character photo')).toBeVisible()
  await page.getByRole('button', { name: 'Use default princess', exact: true }).click()
  await expect(page.getByAltText('Default blonde princess character reference')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Generate video', exact: true })).toBeDisabled()
  await page.getByRole('checkbox', { name: 'I have permission to use the photos I upload.' }).check()
  await page.getByRole('button', { name: 'Generate video', exact: true }).click()
  const video = page.getByLabel('Generated dance video preview')
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.readyState)).toBeGreaterThanOrEqual(1)
  await video.evaluate((node: HTMLVideoElement) => { node.muted = true; return node.play() })
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBeGreaterThan(0)
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download video', exact: true }).click()
  const download = await downloaded
  expect(download.suggestedFilename()).toBe('rumpelstiltskin-ai-dance.mp4')
  const checksum = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
  expect(checksum(await readFile((await download.path())!))).toBe(checksum(await readFile(clip)))
  await expect(page.getByRole('button', { name: 'Generate video', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Make another video', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Download video', exact: true })).toBeEnabled()
})
