import { createDefu } from 'defu'
import * as VanillaConsent from 'vanilla-cookieconsent'
import type { App } from 'vue'
import { inject, ref } from 'vue'
import DefaultConfig from './cookieconsent.config'
import { CookieConsentSymbol, isServer } from './lib'
import type { CookieConsent, CookieConsentConfig, Services } from './types'

// if sections is set, ignore defaults
const mergeConfig = createDefu((obj, key, value) => {
  if (key === 'sections') {
    obj[key] = value
    return true
  }
  return false
})

// plugin
// ---------------------------------

function install(app: App, _options?: CookieConsentConfig) {
  // only run on the client
  if (isServer || window.prerender) {
    app.provide(CookieConsentSymbol, undefined)
    return undefined
  }

  const options = mergeConfig(_options ?? {}, DefaultConfig)

  const services = ref<Services>({})
  const onUpdate = () => {
    // gather accpeted and rejected options
    const compiledList: Services = {}
    const preferences = VanillaConsent.getUserPreferences()
    preferences.acceptedCategories.forEach(category => (compiledList[category] = true))
    preferences.rejectedCategories.forEach(category => (compiledList[category] = false))
    Object.entries(preferences.acceptedServices).forEach(([category, s]) => {
      s.forEach(service => (compiledList[`${category}.${service}`] = true))
    })
    Object.entries(preferences.rejectedServices).forEach(([category, s]) => {
      s.forEach(service => (compiledList[`${category}.${service}`] = false))
    })
    services.value = compiledList
  }

  function acceptService(category: string, service?: string) {
    if (!service) {
      [category, service] = category.split('.')
    }

    // hack: ensure modal has been created
    VanillaConsent.showPreferences()
    VanillaConsent.hidePreferences()

    VanillaConsent.acceptService(
      [service, ...VanillaConsent.getUserPreferences().acceptedServices[category]],
      category,
    )
  }

  VanillaConsent.run({
    ...options,
    onConsent: onUpdate,
    onChange: onUpdate,
  })

  const cookieConsent = {
    ...VanillaConsent,
    services,
    acceptService,
  } satisfies CookieConsent

  app.provide(CookieConsentSymbol, cookieConsent)

  app.config.globalProperties.$cookieconsent = cookieConsent

  return cookieConsent
}

export function createCookieConsent(options?: CookieConsentConfig) {
  return (app: App) => install(app, options)
}

export function useCookieConsent() {
  const CC = inject(CookieConsentSymbol)
  return CC
}
