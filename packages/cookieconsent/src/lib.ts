import type { InjectionKey } from 'vue'
import type { CookieConsent } from './types'

export const CookieConsentSymbol: InjectionKey<CookieConsent | undefined> = Symbol('CookieConsent')

export const isServer = typeof window === 'undefined'
