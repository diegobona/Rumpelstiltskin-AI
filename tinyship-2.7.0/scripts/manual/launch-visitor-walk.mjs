import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pageRegistry } from '../../apps/tanstack-app/src/lib/page-registry.ts'

const root = fileURLToPath(new URL('../../', import.meta.url))
const base = 'http://127.0.0.1:7002'
const out = path.join(root, 'test-results/launch-visitor')
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const report = { pages: [], clicks: [], errors: [], mutations: [] }
page.on('pageerror', error => report.errors.push({ url: page.url(), error: error.message }))
await context.route('**/*', route => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) {
    report.mutations.push(new URL(route.request().url()).pathname)
    return route.abort()
  }
  return route.continue()
})
try {
  for (const entry of Object.values(pageRegistry)) {
    await page.goto(base + entry.path, { waitUntil: 'networkidle' })
    const slug = entry.path === '/' ? 'home' : entry.path.slice(1)
    const before = await page.locator('body').innerText()
    await writeFile(path.join(out, slug + '.txt'), before)
    const anchors = await page.locator('a[href]').evaluateAll(nodes => nodes.map((node, index) => ({ index, text: node.textContent.trim(), href: node.getAttribute('href') })))
    for (const picture of await page.locator('main img').all()) await picture.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(img => img.complete && img.naturalWidth > 0))
    await page.evaluate(() => scrollTo(0, 0))
    await page.screenshot({ path: path.join(out, slug + '-desktop.png'), fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({ path: path.join(out, slug + '-mobile.png'), fullPage: true })
    report.pages.push({ path: entry.path, title: await page.title(), h1: await page.locator('h1').allTextContents(), paragraphs: await page.locator('main p').count(), overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), anchors })
    await page.setViewportSize({ width: 1440, height: 1000 })
    for (const link of anchors) {
      if (!link.href.startsWith('/')) continue
      await page.goto(base + entry.path, { waitUntil: 'networkidle' })
      const expected = new URL(link.href, base).href
      await page.locator('a[href]').nth(link.index).click()
      await page.waitForURL(expected, { waitUntil: 'domcontentloaded', timeout: 10000 })
      report.clicks.push({ source: entry.path, text: link.text, expected, actual: page.url(), passed: page.url() === expected, h1: await page.locator('h1').allTextContents() })
    }
  }
} finally {
  await browser.close()
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
}
console.log(JSON.stringify({ pages: report.pages.length, clicks: report.clicks.length, failedClicks: report.clicks.filter(x => !x.passed), errors: report.errors, overflow: report.pages.filter(x => x.overflow), mutations: report.mutations }, null, 2))
