import {
  addComponent, addImports, addImportsDir, addPlugin, createResolver,
} from '@nuxt/kit'
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest'
import kitModule, { type NovuKitNuxtOptions } from '../src/module'

vi.mock('@nuxt/kit', () => ({
  defineNuxtModule: (definition: unknown) => definition,
  addImports: vi.fn(),
  addImportsDir: vi.fn(),
  addComponent: vi.fn(),
  addPlugin: vi.fn(),
  createResolver: vi.fn(() => ({ resolve: (path: string) => path })),
}))

interface ModuleDefinition {
  meta: Record<string, unknown>
  defaults: NovuKitNuxtOptions
  setup: (options: NovuKitNuxtOptions, nuxt: unknown) => void
}

const definition = kitModule as unknown as ModuleDefinition

const COMPOSABLES = [
  'useAccordion',
  'useCollapse',
  'useCollapseContext',
  'useCollapseController',
  'usePrompt',
  'usePromptProvider',
  'useScrollState',
]

const COMPONENTS = [
  'AccessibleComponent',
  'Accordion',
  'AccordionBody',
  'AccordionHeader',
  'AccordionItem',
  'Collapse',
  'Dialog',
  'HAccordion',
  'HAccordionItem',
  'HScrollState',
  'Image',
  'PromptProvider',
]

const setup = (options: NovuKitNuxtOptions) => {
  const nuxt = { options: { runtimeConfig: { public: {} as Record<string, unknown> } } }

  definition.setup(options, nuxt)

  return nuxt
}

const registeredImports = () => vi.mocked(addImports).mock.calls
  .flatMap(([imports]) => [imports].flat())
  .sort((a, b) => a.name.localeCompare(b.name))

const registeredComponents = () => vi.mocked(addComponent).mock.calls
  .map(([component]) => component)
  .sort((a, b) => a.export!.localeCompare(b.export!))

describe('kit nuxt module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is configured under the kit key without a prefix by default', () => {
    expect(definition.meta).toEqual({
      name: 'kit',
      configKey: 'kit',
    })
    expect(definition.defaults).toEqual({ prefix: '' })
  })

  it('exposes the options in the public runtime config', () => {
    const options = {
      prefix: '',
      animations: { threshold: 50 },
    }

    const nuxt = setup(options)

    expect(nuxt.options.runtimeConfig.public.kit).toEqual(options)
  })

  it('auto-imports the composables', () => {
    setup({ prefix: '' })

    expect(registeredImports()).toEqual(COMPOSABLES.map(name => ({
      name,
      as: name,
      from: '@teamnovu/kit-composables',
    })))
  })

  it('auto-imports the composables with the prefix after use', () => {
    setup({ prefix: 'Kit' })

    expect(registeredImports()).toEqual(COMPOSABLES.map(name => ({
      name,
      as: `useKit${name.slice(3)}`,
      from: '@teamnovu/kit-composables',
    })))
    expect(registeredImports().map(({ as }) => as)).toContain('useKitCollapse')
  })

  it('registers the components', () => {
    setup({ prefix: '' })

    expect(registeredComponents()).toEqual(COMPONENTS.map(name => ({
      name,
      export: name,
      filePath: '@teamnovu/kit-components',
    })))
  })

  it('registers the components with the prefix', () => {
    setup({ prefix: 'Kit' })

    expect(registeredComponents()).toEqual(COMPONENTS.map(name => ({
      name: `Kit${name}`,
      export: name,
      filePath: '@teamnovu/kit-components',
    })))
    expect(registeredComponents().map(({ name }) => name)).toContain('KitDialog')
  })

  it('resolves runtime files relative to the module', () => {
    setup({ prefix: '' })

    expect(createResolver).toHaveBeenCalledWith(expect.stringMatching(/\/src\/module\.ts$/))
  })

  it('auto-imports the runtime composables', () => {
    setup({ prefix: '' })

    expect(addImportsDir).toHaveBeenCalledExactlyOnceWith('./runtime/composables')
  })

  it('adds the animations plugin', () => {
    setup({ prefix: '' })

    expect(addPlugin).toHaveBeenCalledExactlyOnceWith({ src: './runtime/animations.ts' })
  })
})
