import './style.scss'

export { createCookieConsent, useCookieConsent } from './vue'
export { CookieConsentSymbol } from './lib'
export { default as CookieGuard } from './components/CookieGuard.vue'
export { default as useCookieGuard } from './composables/cookieGuard'

export type * from './types'
