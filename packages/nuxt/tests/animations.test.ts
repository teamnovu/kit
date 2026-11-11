import animate from '@teamnovu/kit-animations'
import { inject, useRuntimeConfig } from '#imports'
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest'
import animationsPlugin from '../src/runtime/animations'

vi.mock('#imports', () => ({
  defineNuxtPlugin: <T>(plugin: T) => plugin,
  useRuntimeConfig: vi.fn(),
  inject: vi.fn(),
}))

type PluginSetup = (nuxtApp: {
  vueApp: { use: (...args: unknown[]) => void }
  hook: (name: string, callback: () => void) => void
}) => void

const instance = {
  context: {
    nodes: {
      first: { id: 'first' },
      second: { id: 'second' },
    },
  },
  applyAnimations: vi.fn(),
}

const runPlugin = () => {
  const vueApp = { use: vi.fn() }
  const hooks: Record<string, () => void> = {}
  const hook = vi.fn((name: string, callback: () => void) => {
    hooks[name] = callback
  })

  ;(animationsPlugin as unknown as PluginSetup)({
    vueApp,
    hook,
  })

  return {
    vueApp,
    hooks,
  }
}

describe('animations plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(inject).mockReturnValue(instance)
    vi.mocked(useRuntimeConfig).mockReturnValue({ public: { kit: {} } })
  })

  it('installs kit-animations with the options from the runtime config', () => {
    const options = { threshold: 50 }
    vi.mocked(useRuntimeConfig).mockReturnValue({ public: { kit: { animations: options } } })

    const { vueApp } = runPlugin()

    expect(vueApp.use).toHaveBeenCalledExactlyOnceWith(animate, options)
  })

  it('installs kit-animations with empty options by default', () => {
    const { vueApp } = runPlugin()

    expect(vueApp.use).toHaveBeenCalledExactlyOnceWith(animate, {})
  })

  it('injects the instance provided by kit-animations', () => {
    runPlugin()

    expect(inject).toHaveBeenCalledExactlyOnceWith('@teamnovu/kit-animations')
  })

  it('re-applies the animations of all nodes after a page transition', () => {
    const { hooks } = runPlugin()

    expect(instance.applyAnimations).not.toHaveBeenCalled()

    hooks['page:transition:finish']()

    expect(instance.applyAnimations).toHaveBeenCalledTimes(2)
    expect(instance.applyAnimations).toHaveBeenCalledWith(instance.context.nodes.first)
    expect(instance.applyAnimations).toHaveBeenCalledWith(instance.context.nodes.second)
  })
})
