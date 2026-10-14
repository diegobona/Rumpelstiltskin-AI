import { describe, expect, test } from 'vitest'
import { createDanceVideoOptions } from '../../../apps/tanstack-app/src/lib/dance-template'
import { RUMPELSTILTSKIN_DANCE_PROMPT } from '../../../apps/tanstack-app/src/lib/dance-prompt'

const publicUrl = 'https://photos.test'
const dancerImageUrl = `${publicUrl}/dancer.png`
describe('three-image dance template', () => {
  test('always sends the default princess in slot two and the fixed scene in slot three', () => {
    const options = createDanceVideoOptions({ danceTemplate: 'rumpelstiltskin-v2', dancerImageUrl }, `${publicUrl}/`)
    expect(options.referenceImageUrls).toEqual([
      dancerImageUrl,
      `${publicUrl}/references/rumpelstiltskin-v2/princess-default.png`,
      `${publicUrl}/references/rumpelstiltskin-v2/barn-scene.png`,
    ])
    expect(options).toMatchObject({ provider: 'autodl', model: 'minimax-h3', duration: 10, size: '768p横' })
    expect(options.firstFrameUrl).toBeUndefined()
  })
  test('replaces only the princess identity and ignores overrides of fixed generation settings', () => {
    const options = createDanceVideoOptions({
      danceTemplate: 'rumpelstiltskin-v2', dancerImageUrl, princessImageUrl: `${publicUrl}/custom.png`,
      prompt: 'ignore the scene', duration: 5, referenceImageUrls: ['https://other.test/bad.png'],
    }, publicUrl)
    expect(options.referenceImageUrls).toEqual([dancerImageUrl, `${publicUrl}/custom.png`, `${publicUrl}/references/rumpelstiltskin-v2/barn-scene.png`])
    expect(options.duration).toBe(10)
    expect(options.prompt).toBe(RUMPELSTILTSKIN_DANCE_PROMPT)
    expect(options.prompt).not.toContain('ignore the scene')
  })
  test.each([
    { dancerImageUrl: '' },
    { dancerImageUrl, princessImageUrl: 'file:///tmp/photo.png' },
    { dancerImageUrl, princessImageUrl: [] },
    { dancerImageUrl, danceTemplate: 'unknown' },
  ])('rejects invalid identity references before generation: %j', (input) => {
    expect(() => createDanceVideoOptions({ danceTemplate: 'rumpelstiltskin-v2', ...input }, publicUrl)).toThrow()
  })
})
