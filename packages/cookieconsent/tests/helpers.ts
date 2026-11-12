import * as VanillaConsent from 'vanilla-cookieconsent'
import { vi } from 'vitest'
import { createApp } from 'vue'
import { createCookieConsent, useCookieConsent, type CookieConsentConfig } from '../src'

type UserPreferences = ReturnType<typeof VanillaConsent.getUserPreferences>

export function setPreferences(preferences: Partial<UserPreferences>) {
  vi.mocked(VanillaConsent.getUserPreferences).mockReturnValue({
    acceptType: 'custom',
    acceptedCategories: [],
    rejectedCategories: [],
    acceptedServices: {},
    rejectedServices: {},
    ...preferences,
  })
}

export function installCookieConsent(options?: CookieConsentConfig) {
  const app = createApp({})

  app.use(createCookieConsent(options))

  return {
    app,
    cookieConsent: app.runWithContext(() => useCookieConsent()),
  }
}

export function runConfig() {
  return vi.mocked(VanillaConsent.run).mock.calls[0][0]
}

export function emit(callback: 'onConsent' | 'onChange') {
  const handler = runConfig()[callback] as () => void

  handler()
}
