import { expect, test } from '@playwright/test'
import { pageRegistry } from '../../../apps/tanstack-app/src/lib/page-registry'
import { generatorComparison } from '../../../apps/tanstack-app/src/lib/generator-comparison'

const cases = [
  { entry: pageRegistry.videoGenerator, title: 'Rumpelstiltskin AI Video Generator - Free, Online, No Signup', h1: 'Rumpelstiltskin AI Video Generator', h2: ['How It Works', 'Rumpelstiltskin AI Video Examples', 'FAQ', 'Related Tools'] },
  { entry: pageRegistry.danceVideo, title: 'Rumpelstiltskin Dance Video Generator - Free AI Dance Maker', h1: 'Rumpelstiltskin Dance Video Generator', h2: ['What the Dance Looks Like', 'How to Make a Dance Video', 'FAQ'] },
  { entry: pageRegistry.bestGenerators, title: 'Best Rumpelstiltskin AI Generators (Compared)', h1: 'Best Rumpelstiltskin AI Generators', h2: ['Compare Rumpelstiltskin AI Video Tools', 'Choose a Tool for Your Version of the Meme'] },
]

for (const { entry, title, h1, h2 } of cases) {
  test(`${entry.path} serves its own metadata and body without JavaScript`, async ({ browser, request }) => {
    const response = await request.get(`${entry.path}?utm_source=stage3`)
    expect(response.status()).toBe(200)
    const html = await response.text()
    const body = html.split('<body')[1].split('<script')[0]
    expect(html).toContain(`<title>${title}</title>`)
    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html.match(/<meta\b[^>]*name="description"/g)).toHaveLength(1)
    expect(html).toContain(`content="${entry.description}"`)
    expect(html.match(/<link\b[^>]*rel="canonical"/g)).toHaveLength(1)
    expect(html).toContain(`href="https://rumpelstiltskin-ai.co${entry.path}"`)
    expect(html).not.toMatch(/<meta\b[^>]*name="keywords"/i)
    expect(html).toContain('content="index, follow"')
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`${process.env.SEO_TEST_BASE_URL || 'http://localhost:7001'}${entry.path}`)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText(h1)
    expect(await page.locator('main h2').allTextContents()).toEqual(h2)
    await expect(page.locator('main a[href="/"]').filter({ hasText: /^Rumpelstiltskin AI$/ }).first()).toBeVisible()
    if (entry.path !== pageRegistry.bestGenerators.path) {
      expect(body.indexOf(h1)).toBeLessThan(body.indexOf('id="dance-maker"'))
      expect(body).toContain('Choose dancer photo')
      expect(body).toContain('Generate video')
      expect(body).toContain('Download video')
      await expect(page.locator('.faq-item')).toHaveCount(3)
      await expect(page.locator(`main a[href="/signin?returnTo=${encodeURIComponent(entry.path)}"]`)).toBeVisible()
      for (const image of await page.locator('main img').all()) {
        await expect(image).toHaveAttribute('alt', /.+/)
        await image.scrollIntoViewIfNeeded()
        await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth >= 300 && node.naturalHeight >= 300)).toBe(true)
        expect(Number(await image.getAttribute('width'))).toBeGreaterThanOrEqual(300)
        expect(Number(await image.getAttribute('height'))).toBeGreaterThanOrEqual(300)
      }
    } else {
      expect(body).toContain('<table')
      await expect(page.locator('table')).toHaveCount(1)
      await expect(page.locator('table thead th')).toHaveCount(5)
      expect(await page.locator('table tbody tr').count()).toBeGreaterThanOrEqual(5)
      for (const tool of generatorComparison) await expect(page.locator('table')).toContainText(tool.name)
      await expect(page.locator('table')).toContainText('Not publicly disclosed')
      for (const tool of generatorComparison.filter((item) => item.href.startsWith('https:'))) {
        await expect(page.locator(`table a[href="${tool.source.href}"]`).last()).toBeVisible()
      }
    }
    if (entry.path === pageRegistry.videoGenerator.path) {
      expect(entry.description).toBe('Upload a photo and the Rumpelstiltskin AI video generator turns it into the viral dance clip in under a minute. Free to try on phone or desktop.')
      for (const sibling of [pageRegistry.danceVideo, pageRegistry.bestGenerators]) await expect(page.locator(`section[aria-labelledby="generator-related"] a[href="${sibling.path}"]`)).toBeVisible()
    }
    if (entry.path === pageRegistry.danceVideo.path) expect(body).toContain('rumpelstiltskin ai dance video generator')
    await context.close()
  })
}

test('the sitemap discovers home and all six published registry pages', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)
  const xml = await response.text()
  const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
  expect(locations.sort()).toEqual(Object.values(pageRegistry).map(({ path }) => `https://rumpelstiltskin-ai.co${path}`).sort())
})
