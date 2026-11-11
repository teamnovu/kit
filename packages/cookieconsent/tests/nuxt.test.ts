import { addComponent, addImports } from '@nuxt/kit'
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest'
import cookieConsentModule from '../src/nuxt'
import type { CookieConsentConfig } from '../src'

vi.mock('@nuxt/kit', () => ({
  defineNuxtModule: (definition: unknown) => definition,
  addImports: vi.fn(),
  addComponent: vi.fn(),
}))

interface ModuleDefinition {
  meta: Record<string, unknown>
  setup: (options: CookieConsentConfig, nuxt: unknown) => void
}

const definition = cookieConsentModule as unknown as ModuleDefinition

const setup = (options: CookieConsentConfig) => {
  const nuxt = { options: { runtimeConfig: { public: {} as Record<string, unknown> } } }

  definition.setup(options, nuxt)

  return nuxt
}

describe('nuxt module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is configured under the cookieconsent key', () => {
    expect(definition.meta).toEqual({
      name: '@teamnovu/kit-cookieconsent',
      configKey: 'cookieconsent',
    })
  })

  it('exposes the options in the public runtime config', () => {
    const options = {
      categories: { analytics: { enabled: true } },
    } as CookieConsentConfig

    const nuxt = setup(options)

    expect(nuxt.options.runtimeConfig.public.cookieconsent).toEqual(options)
  })

  it('auto-imports the composables', () => {
    setup({} as CookieConsentConfig)

    expect(addImports).toHaveBeenCalledExactlyOnceWith([
      {
        name: 'useCookieConsent',
        from: '@teamnovu/kit-cookieconsent',
      },
      {
        name: 'useCookieGuard',
        from: '@teamnovu/kit-cookieconsent',
      },
    ])
  })

  it('registers the CookieGuard component', () => {
    setup({} as CookieConsentConfig)

    expect(addComponent).toHaveBeenCalledExactlyOnceWith({
      name: 'CookieGuard',
      export: 'CookieGuard',
      filePath: '@teamnovu/kit-cookieconsent',
    })
  })
})
