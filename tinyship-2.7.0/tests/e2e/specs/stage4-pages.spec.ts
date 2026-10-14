import { expect, test } from '@playwright/test'
import { pageRegistry } from '../../../apps/tanstack-app/src/lib/page-registry'

const cases = [
  {
    entry: pageRegistry.meme,
    title: 'Rumpelstiltskin Meme - Is It AI? How to Make Your Own',
    h1: 'The Rumpelstiltskin Meme',
    h2: ['Is the Rumpelstiltskin Meme AI?', 'Where the Rumpelstiltskin Meme Came From', 'How to Make Your Own Rumpelstiltskin Meme', 'FAQ'],
  },
  {
    entry: pageRegistry.howTo,
    title: 'How to Make a Rumpelstiltskin AI Video (Step by Step)',
    h1: 'How to Make a Rumpelstiltskin AI Video',
    h2: ['1. Choose your dancer photo', '2. Use the included dance template', '3. Generate the video', '4. Download the MP4', 'Common Problems'],
  },
  {
    entry: pageRegistry.movie1987,
    title: '1987 Rumpelstiltskin - The Dance Scene Behind the AI Meme',
    h1: '1987 Rumpelstiltskin: The Dance Scene Behind the Meme',
    h2: ['What the 1987 Scene Is', 'Why It Became a Meme Again', 'Make Your Own Version'],
  },
]

for (const { entry, title, h1, h2 } of cases) {
  test(`${entry.path} exposes its metadata, article and navigation without JavaScript`, async ({ browser, request }) => {
    const response = await request.get(`${entry.path}?utm_source=stage4`)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html).toContain(`<title>${title}</title>`)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html.match(/<meta\b[^>]*name="description"/g)).toHaveLength(1)
    expect(html.match(/<link\b[^>]*rel="canonical"/g)).toHaveLength(1)
    expect(html).toContain(`href="https://rumpelstiltskin-ai.co${entry.path}"`)
    expect(html).toContain('<html lang="en"')
    expect(html).toContain('content="index, follow"')
    expect(html).not.toMatch(/<meta\b[^>]*name="keywords"/i)
    for (const heading of h2) expect(html).toContain(heading)

    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    try {
      await page.goto(`${process.env.SEO_TEST_BASE_URL || 'http://localhost:7001'}${entry.path}`)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('h1')).toHaveText(h1)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', entry.description)
      expect(await page.locator('main h2').allTextContents()).toEqual(h2)
      const homeLink = page.locator('main a[href="/"]').filter({ hasText: /^Rumpelstiltskin AI$/ }).first()
      await expect(homeLink).toBeVisible()
      expect(await homeLink.getAttribute('target')).toBeNull()
      expect(await homeLink.getAttribute('rel') || '').not.toContain('nofollow')

      if (entry.path === pageRegistry.howTo.path) {
        const steps = page.locator('main .article-step')
        await expect(steps).toHaveCount(4)
        for (const step of await steps.all()) {
          const paragraphs = await step.locator(':scope > p').count()
          expect(paragraphs).toBeGreaterThanOrEqual(2)
          expect(paragraphs).toBeLessThanOrEqual(3)
          await expect(step.locator('figure img')).toHaveCount(1)
        }
        await expect(page.locator('section[aria-labelledby="common-problems"] h3')).toHaveCount(3)
        for (const text of ['Choose dancer photo', 'Generate video', 'Download video', 'MP4', 'several minutes']) {
          await expect(page.locator('main')).toContainText(text)
        }
      } else {
        // The history and AI-origin claims must expose their supporting sources to readers.
        expect(await page.locator('main a[href^="https://"]').count()).toBeGreaterThan(0)
      }

      for (const image of await page.locator('main img').all()) {
        await expect(image).toHaveAttribute('alt', /\S+/)
        expect(Number(await image.getAttribute('width'))).toBeGreaterThanOrEqual(300)
        expect(Number(await image.getAttribute('height'))).toBeGreaterThanOrEqual(300)
        await image.scrollIntoViewIfNeeded()
        await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth >= 300 && node.naturalHeight >= 300)).toBe(true)
      }
    } finally {
      await context.close()
    }
  })
}
