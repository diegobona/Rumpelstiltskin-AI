import { beforeEach, describe, expect, test, vi } from 'vitest'
import { creditsConfig, resolveFixedConsumption } from '../../../config/credits'
import { TransactionTypeCode } from '@libs/credits/utils'

type AuthOptions = {
  databaseHooks: { user: { create: { after: (user: { id: string }) => Promise<void> } } }
}

const state = vi.hoisted(() => ({
  options: null as AuthOptions | null,
  enabledOverride: undefined as boolean | undefined,
  addCredits: vi.fn(),
}))

// Capture the options passed by the real auth module, so the test invokes its
// actual user.create.after function rather than reproducing bonus logic.
vi.mock('better-auth', () => ({ betterAuth: (options: AuthOptions) => {
  state.options = options
  return { $options: options }
} }))
vi.mock('better-auth/adapters/drizzle', () => ({ drizzleAdapter: () => ({}) }))
vi.mock('better-auth/plugins', () => ({ admin: () => ({}), captcha: () => ({}), phoneNumber: () => ({}) }))
vi.mock('better-auth/api', () => ({ createAuthMiddleware: (handler: unknown) => handler, APIError: Error }))
vi.mock('better-auth/next-js', () => ({ toNextJsHandler: vi.fn() }))
vi.mock('validation-better-auth', () => ({ validator: () => ({}), StandardAdapter: () => ({}) }))
vi.mock('@libs/auth/plugins/wechat', () => ({ wechatPlugin: () => ({}) }))
vi.mock('@libs/database', () => ({ db: {}, user: {}, account: {}, session: {}, verification: {}, isSqliteDialect: () => true }))
vi.mock('@libs/sms', () => ({ sendSMS: vi.fn() }))
vi.mock('@libs/email', () => ({ sendVerificationEmail: vi.fn(), sendResetPasswordEmail: vi.fn() }))
vi.mock('@libs/validators/user', () => ({ emailSignInSchema: {}, emailSignUpSchema: {} }))
vi.mock('@libs/i18n', () => ({ locales: ['en'], defaultLocale: 'en', getTranslation: vi.fn() }))
vi.mock('@libs/credits', async () => ({
  creditService: { addCredits: state.addCredits },
  TransactionTypeCode: (await import('@libs/credits/utils')).TransactionTypeCode,
}))
vi.mock('@config', async () => {
  const { creditsConfig: actualCredits } = await import('../../../config/credits')
  return { config: {
    credits: { signupBonus: {
      amount: actualCredits.signupBonus.amount,
      get enabled() { return state.enabledOverride ?? actualCredits.signupBonus.enabled },
    } },
    auth: { requireEmailVerification: false, socialProviders: { google: {}, github: {}, wechat: {} } },
    captcha: { enabled: false },
  } }
})

import '@libs/auth/auth'

describe('new account dance trial bonus', () => {
  beforeEach(() => {
    state.enabledOverride = undefined
    state.addCredits.mockReset().mockResolvedValue(undefined)
  })

  test('the configured bonus covers one MiniMax H3 video', () => {
    expect(creditsConfig.signupBonus).toEqual({ enabled: true, amount: 40 })
    expect(creditsConfig.signupBonus.amount).toBe(resolveFixedConsumption(creditsConfig.fixedConsumption.aiVideo, 'minimax-h3'))
  })

  test('the actual after-create hook grants each new user 40 credits with trial metadata', async () => {
    const afterCreate = state.options!.databaseHooks.user.create.after
    await afterCreate({ id: 'new-user-1' })
    await afterCreate({ id: 'new-user-2' })
    expect(state.addCredits.mock.calls).toEqual([
      [{ userId: 'new-user-1', amount: 40, type: 'bonus', description: TransactionTypeCode.BONUS, metadata: { purpose: 'signup_dance_trial' } }],
      [{ userId: 'new-user-2', amount: 40, type: 'bonus', description: TransactionTypeCode.BONUS, metadata: { purpose: 'signup_dance_trial' } }],
    ])
  })

  test('disabling the bonus skips the credit service', async () => {
    state.enabledOverride = false
    await state.options!.databaseHooks.user.create.after({ id: 'new-user-3' })
    expect(state.addCredits).not.toHaveBeenCalled()
  })
})
