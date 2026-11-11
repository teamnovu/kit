import { enableAutoUnmount, mount } from '@vue/test-utils'
import {
  afterEach, beforeEach, describe, expect, it,
} from 'vitest'
import { isRef, nextTick, type Ref } from 'vue'
import HScrollState from '../src/HScrollState.vue'

interface ScrollSlotProps {
  beginning: Ref<boolean>
  downward: Ref<boolean>
  y: Ref<number>
}

enableAutoUnmount(afterEach)

async function scrollTo(y: number) {
  document.documentElement.scrollTop = y
  window.dispatchEvent(new Event('scroll'))
  await nextTick()
}

function mountScrollState(props: Record<string, unknown> = {}) {
  let slotProps!: ScrollSlotProps

  mount(HScrollState, {
    props,
    slots: {
      default: (props: ScrollSlotProps) => {
        slotProps = props
        return null
      },
    },
  })

  return () => slotProps
}

describe('HScrollState', () => {
  beforeEach(() => {
    document.documentElement.scrollTop = 0
  })

  it('passes beginning, downward and y as refs to its slot', () => {
    const slot = mountScrollState()

    expect(isRef(slot().beginning)).toBe(true)
    expect(isRef(slot().downward)).toBe(true)
    expect(isRef(slot().y)).toBe(true)
    expect(slot().beginning.value).toBe(true)
    expect(slot().downward.value).toBe(false)
    expect(slot().y.value).toBe(0)
  })

  it('updates the slot refs while scrolling', async () => {
    const slot = mountScrollState()

    await scrollTo(100)
    expect(slot().y.value).toBe(100)
    expect(slot().downward.value).toBe(true)
    expect(slot().beginning.value).toBe(false)

    await scrollTo(0)
    expect(slot().downward.value).toBe(false)
    expect(slot().beginning.value).toBe(true)
  })

  it('forwards scrollThreshold and topThreshold', async () => {
    const slot = mountScrollState({
      scrollThreshold: 0,
      topThreshold: 50,
    })

    await scrollTo(10)
    expect(slot().downward.value).toBe(true)
    expect(slot().beginning.value).toBe(true)

    await scrollTo(60)
    expect(slot().beginning.value).toBe(false)

    await scrollTo(55)
    expect(slot().downward.value).toBe(false)
  })
})
