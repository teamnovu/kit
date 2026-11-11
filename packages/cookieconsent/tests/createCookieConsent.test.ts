import * as VanillaConsent from 'vanilla-cookieconsent'
import type { Translation } from 'vanilla-cookieconsent'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import { inject } from 'vue'
import { CookieConsentSymbol } from '../src'
import DefaultConfig from '../src/cookieconsent.config'
import {
  emit, installCookieConsent, runConfig, setPreferences,
} from './helpers'

vi.mock('vanilla-cookieconsent')

const germanPreferencesModal = () => (runConfig().language.translations.de as Translation).preferencesModal

describe('createCookieConsent', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    Reflect.deleteProperty(window, 'prerender')
  })

  describe('install', () => {
    it('runs vanilla-cookieconsent once with the update callbacks', () => {
      installCookieConsent()

      expect(VanillaConsent.run).toHaveBeenCalledOnce()
      expect(runConfig()).toEqual({
        ...DefaultConfig,
        onConsent: expect.any(Function),
        onChange: expect.any(Function),
      })
    })

    it('neither runs nor provides an api while prerendering', () => {
      window.prerender = true

      const { app } = installCookieConsent()

      expect(VanillaConsent.run).not.toHaveBeenCalled()
      expect(app.runWithContext(() => inject(CookieConsentSymbol, null))).toBeUndefined()
      expect(app.config.globalProperties.$cookieconsent).toBeUndefined()
    })

    it('provides the vanilla api extended with services', () => {
      const { app, cookieConsent } = installCookieConsent()

      expect(Object.keys(cookieConsent!).sort()).toEqual([
        'acceptCategory',
        'acceptService',
        'acceptedCategory',
        'acceptedService',
        'eraseCookies',
        'getConfig',
        'getCookie',
        'getUserPreferences',
        'hide',
        'hidePreferences',
        'loadScript',
        'reset',
        'run',
        'services',
        'setCookieData',
        'setLanguage',
        'show',
        'showPreferences',
        'validConsent',
        'validCookie',
      ])
      expect(cookieConsent!.showPreferences).toBe(VanillaConsent.showPreferences)
      expect(app.config.globalProperties.$cookieconsent).toBe(cookieConsent)
    })
  })

  describe('config', () => {
    it('lets user values win over the defaults', () => {
      installCookieConsent({
        guiOptions: { consentModal: { layout: 'bar' } },
        categories: { analytics: { enabled: true } },
      })

      expect(runConfig().guiOptions).toEqual({
        consentModal: {
          layout: 'bar',
          equalWeightButtons: true,
        },
        preferencesModal: { equalWeightButtons: true },
      })
      expect(runConfig().categories.analytics).toEqual({
        enabled: true,
        readOnly: false,
        autoClear: { cookies: [{ name: /^_/ }] },
      })
      expect(runConfig().categories.necessary).toEqual({
        enabled: true,
        readOnly: true,
      })
    })

    it('concatenates arrays with the user entries first', () => {
      installCookieConsent({
        categories: {
          analytics: { autoClear: { cookies: [{ name: '_ga' }] } },
        },
      })

      expect(runConfig().categories.analytics.autoClear?.cookies).toEqual([{ name: '_ga' }, { name: /^_/ }])
    })

    it('replaces sections instead of merging them', () => {
      const sections = [{ title: 'Eigene Cookies' }]

      installCookieConsent({
        language: {
          default: 'de',
          translations: {
            de: { preferencesModal: { sections } },
          },
        },
      } as never)

      expect(germanPreferencesModal().sections).toEqual(sections)
      expect(germanPreferencesModal().title).toBe('Cookie-Einstellungen')
    })

    it('replaces sections with an empty list', () => {
      installCookieConsent({
        language: {
          default: 'de',
          translations: {
            de: { preferencesModal: { sections: [] } },
          },
        },
      } as never)

      expect(germanPreferencesModal().sections).toEqual([])
    })

    it('keeps the default de translations next to user translations', () => {
      const en = {
        consentModal: { title: 'Cookies' },
        preferencesModal: {
          title: 'Cookie settings',
          sections: [],
        },
      }

      installCookieConsent({
        language: {
          default: 'en',
          translations: { en },
        },
      })

      expect(runConfig().language).toEqual({
        default: 'en',
        translations: {
          de: DefaultConfig.language.translations.de,
          en,
        },
      })
    })
  })

  describe('services', () => {
    it('is empty before consent is given', () => {
      const { cookieConsent } = installCookieConsent()

      expect(cookieConsent!.services.value).toEqual({})
    })

    it('lists accepted and rejected categories and services on consent', () => {
      const { cookieConsent } = installCookieConsent()
      setPreferences({
        acceptedCategories: ['necessary', 'analytics'],
        rejectedCategories: ['functional'],
        acceptedServices: {
          analytics: ['matomo'],
          functional: [],
        },
        rejectedServices: {
          analytics: [],
          functional: ['youtube'],
        },
      })

      emit('onConsent')

      expect(cookieConsent!.services.value).toEqual({
        'necessary': true,
        'analytics': true,
        'functional': false,
        'analytics.matomo': true,
        'functional.youtube': false,
      })
    })

    it('updates when the consent changes', () => {
      const { cookieConsent } = installCookieConsent()
      setPreferences({
        acceptedCategories: ['necessary'],
        rejectedCategories: ['functional'],
        rejectedServices: { functional: ['youtube'] },
      })
      emit('onConsent')
      setPreferences({
        acceptedCategories: ['necessary', 'functional'],
        acceptedServices: { functional: ['youtube'] },
      })

      emit('onChange')

      expect(cookieConsent!.services.value).toEqual({
        'necessary': true,
        'functional': true,
        'functional.youtube': true,
      })
    })
  })

  describe('acceptService', () => {
    beforeEach(() => {
      setPreferences({ acceptedServices: { functional: ['vimeo'] } })
    })

    it('accepts a service in addition to the accepted services of its category', () => {
      const { cookieConsent } = installCookieConsent()

      cookieConsent!.acceptService('functional.youtube')

      expect(VanillaConsent.acceptService).toHaveBeenCalledExactlyOnceWith(['youtube', 'vimeo'], 'functional')
    })

    it('accepts category and service as separate arguments', () => {
      const { cookieConsent } = installCookieConsent()

      cookieConsent!.acceptService('functional', 'youtube')

      expect(VanillaConsent.acceptService).toHaveBeenCalledExactlyOnceWith(['youtube', 'vimeo'], 'functional')
    })

    it('creates the preferences modal before accepting', () => {
      const { cookieConsent } = installCookieConsent()

      cookieConsent!.acceptService('functional.youtube')

      const [show] = vi.mocked(VanillaConsent.showPreferences).mock.invocationCallOrder
      const [hide] = vi.mocked(VanillaConsent.hidePreferences).mock.invocationCallOrder
      const [accept] = vi.mocked(VanillaConsent.acceptService).mock.invocationCallOrder
      expect(show).toBeLessThan(hide)
      expect(hide).toBeLessThan(accept)
    })
  })
})
