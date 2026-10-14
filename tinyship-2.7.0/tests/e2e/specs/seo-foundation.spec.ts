import { expect, test } from '@playwright/test'
import { homeCopy } from '../../../apps/tanstack-app/src/lib/home-copy'
import { pageRegistry } from '../../../apps/tanstack-app/src/lib/page-registry'

const origin = 'https://rumpelstiltskin-ai.co'

test('homepage serves its heading, body and one query-free canonical in raw HTML', async ({ request }) => {
  const response = await request.get('/?utm_source=verification')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toMatch(/<h1\b[^>]*>Rumpelstiltskin AI Video Maker<\/h1>/)
  expect(html).toContain(homeCopy.intro)
  expect(html).toContain('<html lang="en"')
  expect(html.match(/<link\b[^>]*rel="canonical"[^>]*>/g)).toHaveLength(1)
  expect(html).toContain(`href="${origin}/"`)
  expect(html).not.toMatch(/<meta\b[^>]*name="keywords"/i)
  expect(html).toMatch(/<meta\b[^>]*name="robots"[^>]*content="index, follow"/)
})

test('www requests permanently redirect to the apex and preserve path and query', async ({ request }) => {
  // Wrangler rewrites Host in local preview. A second local upstream exercises
  // the production www host without deploying or depending on public DNS.
  const wwwBase = process.env.SEO_TEST_WWW_BASE_URL || ''
  const response = await request.get(`${wwwBase}/signin?returnTo=%2Faccount`, {
    headers: { Host: 'www.rumpelstiltskin-ai.co' },
    maxRedirects: 0,
  })
  expect(response.status()).toBe(301)
  expect(response.headers().location).toBe(`${origin}/signin?returnTo=%2Faccount`)
})

test('robots allows every directory and points at the canonical sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt')
  expect(response.status()).toBe(200)
  const text = await response.text()
  expect(text).toContain('User-agent: *')
  expect(text).toContain('Allow: /')
  expect(text).not.toMatch(/Disallow:\s*\S/)
  expect(text).toContain(`Sitemap: ${origin}/sitemap.xml`)
})

test('sitemap contains only the currently published public pages', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.status()).toBe(200)
  const xml = await response.text()
  expect(response.headers()['content-type']).toContain('xml')
  const pages = Object.values(pageRegistry)
  expect(xml.match(/<loc>/g)).toHaveLength(pages.length)
  for (const entry of pages) expect(xml).toContain(`<loc>${origin}${entry.path}</loc>`)
})

for (const path of ['/signin', '/signup', '/forgot-password', '/reset-password', '/payment-success', '/payment-cancel']) {
  test(`${path} is SSR, canonical and noindex`, async ({ request }) => {
    const response = await request.get(`${path}?utm_source=verification`)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toMatch(/<h1\b/)
    expect(html).toMatch(/<meta\b[^>]*name="robots"[^>]*content="noindex, follow"/)
    expect(html.match(/<link\b[^>]*rel="canonical"[^>]*>/g)).toHaveLength(1)
    expect(html).toContain(`href="${origin}${path}"`)
    expect(html).not.toMatch(/<meta\b[^>]*name="keywords"/i)
  })
}

test('unknown pages return a server-rendered 404 and a home link', async ({ request }) => {
  const response = await request.get('/does-not-exist?query=ignored')
  expect(response.status()).toBe(404)
  const html = await response.text()
  expect(html).toMatch(/<h1\b[^>]*>Page not found<\/h1>/)
  expect(html).toContain('Rumpelstiltskin AI')
  expect(html).toContain(`href="${origin}/does-not-exist"`)
  expect(html).toMatch(/name="robots"[^>]*content="noindex, follow"/)
})

test('localized demo pages are no longer registered', async ({ request }) => {
  for (const path of ['/en', '/zh-CN', '/en/video-generate']) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status()).toBe(404)
  }
})
