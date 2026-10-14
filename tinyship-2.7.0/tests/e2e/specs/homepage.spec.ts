import { expect, test } from '@playwright/test'
import { pageRegistry, moreAiVideoTools, registeredSitemapPaths } from '../../../apps/tanstack-app/src/lib/page-registry'
import { homeCopy } from '../../../apps/tanstack-app/src/lib/home-copy'

test('home metadata, heading order, copy, images and exact six internal links are SSR', async ({ request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)
  const html = await response.text()
  const content = html.split('<body')[1].split('<script')[0]
  expect(html).toContain(`<title>${pageRegistry.home.title}</title>`)
  expect(html).toContain(`name="description" content="${pageRegistry.home.description}"`)
  expect(html.match(/<h1\b/g)).toHaveLength(1)
  expect(html.match(/<h2\b[^>]*>(.*?)<\/h2>/g)?.map((tag) => tag.replace(/<[^>]+>/g, ''))).toEqual([
    'How to Make a Rumpelstiltskin AI Video',
    'Rumpelstiltskin AI Video Examples',
    'Rumpelstiltskin AI FAQ',
    'More AI Video Tools',
  ])
  expect(content.indexOf(pageRegistry.home.h1)).toBeLessThan(content.indexOf('id="dance-maker"'))
  expect(content.indexOf('id="dance-maker"')).toBeLessThan(content.indexOf(homeCopy.intro))
  for (const label of [homeCopy.tool.photoLabel, homeCopy.tool.choosePhoto, homeCopy.tool.princessLabel, homeCopy.tool.generateButton, homeCopy.tool.resultTitle, homeCopy.tool.downloadButton]) expect(content).toContain(label)
  for (const step of homeCopy.how.steps) expect(content).toContain(`alt="${step.alt}"`)
  for (const example of homeCopy.examples.items) {
    expect(content).toContain(`src="${example.image}"`)
    expect(content).toContain(`alt="${example.alt}"`)
  }
  for (const item of homeCopy.faq.items) expect(content).toContain(item.question)
  const related = content.split('id="more-video-tools"')[1]
  expect(related.match(/<h3\b/g)).toHaveLength(6)
  let previous = -1
  for (const item of moreAiVideoTools) {
    const anchor = `<a href="${item.href}">${item.anchorText}</a>`
    expect(related).toContain(anchor)
    expect(related.indexOf(anchor)).toBeGreaterThan(previous)
    previous = related.indexOf(anchor)
  }
  expect(related).not.toMatch(/nofollow|target="_blank"/)
  expect(html).not.toMatch(/<meta\b[^>]*name="keywords"/)
  expect(registeredSitemapPaths(['/'])).toEqual(['/'])
})

test('illustrations and examples load with genuine image dimensions', async ({ request }) => {
  for (const example of homeCopy.examples.items) {
    const response = await request.get(example.image)
    expect(response.status()).toBe(200)
    const bytes = await response.body()
    expect(bytes.readUInt32BE(16)).toBeGreaterThanOrEqual(300)
    expect(bytes.readUInt32BE(20)).toBeGreaterThanOrEqual(300)
  }
  for (const step of homeCopy.how.steps) {
    const response = await request.get(step.image)
    expect(response.status()).toBe(200)
    if (step.image.endsWith('.svg')) expect(await response.text()).toContain('<svg')
    else {
      const bytes = await response.body()
      expect(bytes.readUInt32BE(16)).toBeGreaterThanOrEqual(300)
      expect(bytes.readUInt32BE(20)).toBeGreaterThanOrEqual(300)
    }
  }
})
