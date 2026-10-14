import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const output = fileURLToPath(new URL('../../test-results/launch-content/', import.meta.url))
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const pages = [
  { url: 'https://www.makeviral.ai/pricing', questions: ['Can I try it before I subscribe?'] },
  { url: 'https://rumpelstiltskin-ai.org/', questions: ['How long does it take to generate a Rumpelstiltskin AI video?', 'Is Rumpelstiltskin AI free or paid, and how does pricing work?'] },
  { url: 'https://rumpelstiltskin.info/', questions: ['Is the Rumpelstiltskin video generator free?', 'Do I need to sign in?'] },
]
const results = []
for (const item of pages) {
  const page = await browser.newPage()
  await page.goto(item.url, { waitUntil: 'domcontentloaded' })
  for (const question of item.questions) {
    const locator = page.getByText(question, { exact: true }).first()
    await locator.click()
    await page.waitForTimeout(300)
  }
  const text = await page.locator('body').innerText()
  results.push({ ...item, text })
  await page.close()
}
await writeFile(`${output}/external-faqs.json`, JSON.stringify(results, null, 2))
await browser.close()
console.log(JSON.stringify(results.map(r => ({ url: r.url, excerpts: r.text.split('\n').filter(s => /0 credits|sign.up|sign up|free|2.4|minutes|before.*sign|sign in|account/i.test(s)) })), null, 2))
