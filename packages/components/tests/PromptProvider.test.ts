import { usePrompt, type PromptFn } from '@teamnovu/kit-composables'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import {
  afterEach, describe, expect, it,
} from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import PromptProvider from '../src/PromptProvider.vue'

interface PromptSlotProps {
  isOpen: boolean
  resolve: (answer: { ok: boolean }) => void
  promptOptions?: { title?: string }
}

enableAutoUnmount(afterEach)

function mountPromptProvider() {
  let prompt!: PromptFn
  let slotProps!: PromptSlotProps

  const Consumer = defineComponent({
    setup() {
      prompt = usePrompt()
      return () => null
    },
  })

  const wrapper = mount(PromptProvider, {
    slots: {
      default: (props: PromptSlotProps) => {
        slotProps = props
        return [
          h('p', props.isOpen ? props.promptOptions?.title : 'closed'),
          h(Consumer),
        ]
      },
    },
  })

  return {
    wrapper,
    prompt: (title: string) => prompt({ title }),
    slot: () => slotProps,
  }
}

describe('PromptProvider', () => {
  it('provides isOpen, resolve and promptOptions as slot props', () => {
    const { wrapper, slot } = mountPromptProvider()

    expect(slot().isOpen).toBe(false)
    expect(slot().promptOptions).toBeUndefined()
    expect(slot().resolve).toBeTypeOf('function')
    expect(wrapper.text()).toBe('closed')
  })

  it('opens for a prompt of a descendant and resolves it', async () => {
    const { wrapper, prompt, slot } = mountPromptProvider()

    const answer = prompt('Delete item?')
    await nextTick()
    expect(slot().isOpen).toBe(true)
    expect(slot().promptOptions).toEqual({ title: 'Delete item?' })
    expect(wrapper.text()).toBe('Delete item?')

    slot().resolve({ ok: true })
    await flushPromises()

    await expect(answer).resolves.toEqual({ ok: true })
    expect(slot().isOpen).toBe(false)
    expect(wrapper.text()).toBe('closed')
  })
})
