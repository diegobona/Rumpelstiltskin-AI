import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import { DanceMaker } from '../../../apps/tanstack-app/src/components/dance-maker'
import { homeCopy } from '../../../apps/tanstack-app/src/lib/home-copy'

describe('dance maker initial server render', () => {
  test('renders both character inputs and download copy without the removed setting panel', () => {
    const html = renderToStaticMarkup(createElement(DanceMaker, { copy: homeCopy.tool }))
    for (const label of [homeCopy.tool.photoLabel, homeCopy.tool.photoHint, homeCopy.tool.choosePhoto, homeCopy.tool.princessLabel, homeCopy.tool.princessHint, homeCopy.tool.choosePrincess, homeCopy.tool.defaultPrincessLabel, homeCopy.tool.generateButton, homeCopy.tool.resultTitle, homeCopy.tool.downloadButton, homeCopy.tool.downloadHint, homeCopy.tool.progressHint, homeCopy.tool.fidelityHint, homeCopy.tool.signInHint]) {
      expect(html).toContain(label)
    }
    expect(html.match(/type="file"/g)).toHaveLength(2)
    expect(html.match(/aria-required="true"/g)).toHaveLength(1)
    expect(html).toContain('src="/images/references/princess-default-v2.png"')
    expect(html).not.toContain('src="/images/references/barn-scene.png"')
    expect(html).not.toContain('Your dance setting')
    expect(html).not.toContain('type="radio"')
    expect(html).not.toMatch(/<h[12][\s>]/)
    expect(html).not.toContain('<video')
  })

  test('shows service unavailability in server HTML while retaining the photo controls', () => {
    const html = renderToStaticMarkup(createElement(DanceMaker, { copy: homeCopy.tool, isAvailable: false }))
    expect(html).toContain(homeCopy.tool.unavailableHint)
    expect(html).toContain(homeCopy.tool.choosePhoto)
    expect(html).toContain('disabled=""')
  })
})
