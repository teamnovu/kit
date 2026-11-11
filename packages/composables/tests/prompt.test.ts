import { enableAutoUnmount, mount } from '@vue/test-utils'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'
import { h, nextTick } from 'vue'
import {
  usePrompt, usePromptProvider, type PromptFn,
} from '../src'
import { setupComponent, withSetup } from './helpers'

enableAutoUnmount(afterEach)

function mountProvider() {
  let provider!: ReturnType<typeof usePromptProvider>
  let prompt!: PromptFn

  const Child = setupComponent(() => {
    prompt = usePrompt()
    return () => null
  })

  mount(setupComponent(() => {
    provider = usePromptProvider()
    return () => h(Child)
  }))

  return {
    provider,
    prompt,
  }
}

describe('usePrompt', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws without a prompt provider', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(() => withSetup(() => usePrompt())).toThrow('The prompt function was not properly provided.')
  })
})

describe('usePromptProvider', () => {
  it('starts closed without options', () => {
    const { provider } = mountProvider()

    expect(provider.isOpen.value).toBe(false)
    expect(provider.promptOptions.value).toBeUndefined()
  })

  it('opens with the prompt options when prompted', () => {
    const { provider, prompt } = mountProvider()
    const options = {
      title: 'Delete item',
      message: 'Are you sure?',
    }

    prompt(options)

    expect(provider.isOpen.value).toBe(true)
    expect(provider.promptOptions.value).toEqual(options)
  })

  it('settles the prompt promise with the resolved answer and closes', async () => {
    const { provider, prompt } = mountProvider()
    const settled = vi.fn()

    prompt({ title: 'Delete item' }).then(settled)
    await nextTick()
    expect(settled).not.toHaveBeenCalled()

    provider.resolve({ ok: true })
    await nextTick()

    expect(settled).toHaveBeenCalledWith({ ok: true })
    expect(provider.isOpen.value).toBe(false)
  })

  it('resolves each prompt with its own answer', async () => {
    const { provider, prompt } = mountProvider()

    const first = prompt({ title: 'First' })
    provider.resolve({ ok: false })
    const second = prompt({ title: 'Second' })
    expect(provider.promptOptions.value).toEqual({ title: 'Second' })
    provider.resolve({ ok: true })

    await expect(first).resolves.toEqual({ ok: false })
    await expect(second).resolves.toEqual({ ok: true })
  })
})
