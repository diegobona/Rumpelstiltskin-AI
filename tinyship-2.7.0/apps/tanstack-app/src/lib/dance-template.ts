import type { VideoGenerationOptions } from '@libs/ai/types'
import { aiVideoConfig } from '../../../../config/aiVideo'
import { RUMPELSTILTSKIN_DANCE_PROMPT } from './dance-prompt'

export const DANCE_REFERENCE_KEYS = {
  princess: 'references/rumpelstiltskin-v2/princess-default.png',
  scene: 'references/rumpelstiltskin-v2/barn-scene.png',
} as const

function imageUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('A valid reference image URL is required')
  const parsed = new URL(value)
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.hash) {
    throw new Error('Reference images must use public HTTPS URLs')
  }
  return parsed.href
}

/** Server-owned template: requests may choose identities, never the fixed scene or prompt. */
export function createDanceVideoOptions(body: Record<string, unknown>, publicStorageUrl: string): VideoGenerationOptions {
  if (body.danceTemplate !== 'rumpelstiltskin-v2') throw new Error('Unknown dance template')
  const base = imageUrl(publicStorageUrl).replace(/\/+$/, '')
  const dancer = imageUrl(body.dancerImageUrl)
  const princess = body.princessImageUrl === undefined
    ? `${base}/${DANCE_REFERENCE_KEYS.princess}`
    : imageUrl(body.princessImageUrl)
  return {
    provider: 'autodl',
    model: aiVideoConfig.defaultModels.autodl,
    prompt: RUMPELSTILTSKIN_DANCE_PROMPT,
    referenceImageUrls: [dancer, princess, `${base}/${DANCE_REFERENCE_KEYS.scene}`],
    duration: 10,
    size: '768p横',
    watermark: false,
  }
}
