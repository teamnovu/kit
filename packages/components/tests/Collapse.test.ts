import { enableAutoUnmount, mount } from '@vue/test-utils'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import { h, nextTick, ref } from 'vue'
import Collapse from '../src/Collapse.vue'
import { collectWarnings, stubScrollHeight, useAnimationTimers } from './helpers'

const SCROLL_HEIGHT = 200

interface CollapseSlotProps {
  ref: (element: unknown) => void
  open: () => void
  close: () => void
  toggle: () => void
  isOpen: boolean
  isTransitioning: boolean
}

enableAutoUnmount(afterEach)

function mountCollapse(props: Record<string, unknown> = {}, warnHandler?: (message: string) => void) {
  let slotProps!: CollapseSlotProps

  const wrapper = mount(Collapse, {
    props,
    slots: {
      default: (props: CollapseSlotProps) => {
        slotProps = props
        return h('div', {
          'ref': props.ref,
          'data-collapse': '',
        }, 'content')
      },
    },
    global: { config: { warnHandler } },
  })

  const element = wrapper.get('[data-collapse]').element as HTMLElement
  stubScrollHeight(element, SCROLL_HEIGHT)

  return {
    wrapper,
    element,
    slot: () => slotProps,
  }
}

describe('Collapse', () => {
  beforeEach(() => {
    useAnimationTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('slot props', () => {
    it('exposes ref, open, close, toggle, isOpen and isTransitioning', () => {
      const { slot } = mountCollapse()

      expect(Object.keys(slot()).sort()).toEqual(['close', 'isOpen', 'isTransitioning', 'open', 'ref', 'toggle'])
      expect(slot().ref).toBeTypeOf('function')
      expect(slot().open).toBeTypeOf('function')
      expect(slot().close).toBeTypeOf('function')
      expect(slot().toggle).toBeTypeOf('function')
      expect(slot().isOpen).toBe(false)
      expect(slot().isTransitioning).toBe(false)
    })

    it('opens, closes and toggles through the slot functions', async () => {
      const { slot } = mountCollapse()

      slot().open()
      await nextTick()
      expect(slot().isOpen).toBe(true)

      slot().close()
      await nextTick()
      expect(slot().isOpen).toBe(false)

      slot().toggle()
      await nextTick()
      expect(slot().isOpen).toBe(true)

      slot().toggle()
      await nextTick()
      expect(slot().isOpen).toBe(false)
    })

    it('reports isTransitioning while the animation runs', async () => {
      const { slot } = mountCollapse()

      slot().toggle()
      await vi.advanceTimersByTimeAsync(100)
      expect(slot().isTransitioning).toBe(true)

      await vi.advanceTimersByTimeAsync(400)
      expect(slot().isTransitioning).toBe(false)
    })

    it('accepts null in ref', () => {
      const { slot } = mountCollapse()

      expect(() => slot().ref(null)).not.toThrow()
    })

    it('throws when ref receives something other than an HTMLElement', () => {
      const { slot } = mountCollapse()
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

      expect(() => slot().ref(svg)).toThrow('[Collapse]: ref must be an HTMLElement')
      expect(() => slot().ref({})).toThrow('[Collapse]: ref must be an HTMLElement')
    })
  })

  describe('open state', () => {
    it('is initially closed by default and hides the element', () => {
      const { element, slot } = mountCollapse()

      expect(slot().isOpen).toBe(false)
      expect(element.style.display).toBe('none')
    })

    it('is initially open when initiallyClosed is false', () => {
      const { element, slot } = mountCollapse({ initiallyClosed: false })

      expect(slot().isOpen).toBe(true)
      expect(element.style.display).toBe('')
    })

    it('uses the open prop over initiallyClosed', () => {
      const { element, slot } = mountCollapse({
        open: true,
        initiallyClosed: true,
      })

      expect(slot().isOpen).toBe(true)
      expect(element.style.display).toBe('')
    })

    it('animates the element open and clears the inline styles when finished', async () => {
      const { element, slot } = mountCollapse()

      slot().toggle()
      await vi.advanceTimersByTimeAsync(150)
      expect(element.style.display).toBe('')
      expect(element.style.overflow).toBe('hidden')
      expect(parseFloat(element.style.height)).toBeGreaterThan(0)
      expect(parseFloat(element.style.height)).toBeLessThan(SCROLL_HEIGHT)

      await vi.advanceTimersByTimeAsync(250)
      expect(element.style.height).toBe('')
      expect(element.style.overflow).toBe('')
      expect(element.style.display).toBe('')
    })

    it('hides the element after closing', async () => {
      const { element, slot } = mountCollapse({ initiallyClosed: false })

      slot().toggle()
      await vi.advanceTimersByTimeAsync(400)

      expect(element.style.height).toBe('')
      expect(element.style.overflow).toBe('')
      expect(element.style.display).toBe('none')
    })

    it('respects the duration prop', async () => {
      const { element, slot } = mountCollapse({ duration: 800 })

      slot().toggle()
      await vi.advanceTimersByTimeAsync(500)
      expect(element.style.overflow).toBe('hidden')

      await vi.advanceTimersByTimeAsync(500)
      expect(element.style.overflow).toBe('')
      expect(element.style.height).toBe('')
    })
  })

  describe('update:open', () => {
    it('emits false on mount without an open prop and then every toggle', async () => {
      const { wrapper, slot } = mountCollapse()
      await nextTick()

      expect(wrapper.emitted('update:open')).toEqual([[false]])

      slot().toggle()
      await nextTick()
      slot().toggle()
      await nextTick()

      expect(wrapper.emitted('update:open')).toEqual([[false], [true], [false]])
    })

    it('does not emit on mount when the open prop is given', async () => {
      const { wrapper } = mountCollapse({ open: false })
      await nextTick()

      expect(wrapper.emitted('update:open')).toBeUndefined()
    })

    it('supports v-model:open', async () => {
      const open = ref(false)
      const { wrapper, element, slot } = mountCollapse({
        'open': open.value,
        'onUpdate:open': (value: boolean) => {
          open.value = value
          wrapper.setProps({ open: value })
        },
      })

      slot().toggle()
      await nextTick()
      expect(open.value).toBe(true)
      expect(wrapper.emitted('update:open')).toEqual([[true]])

      await wrapper.setProps({ open: false })
      expect(slot().isOpen).toBe(false)
      expect(wrapper.emitted('update:open')).toEqual([[true]])

      await vi.advanceTimersByTimeAsync(400)
      expect(element.style.display).toBe('none')
    })
  })

  describe('transition prop', () => {
    it('accepts an easing function without warnings and eases with it', async () => {
      const { warnings, warnHandler } = collectWarnings()
      const easing = vi.fn((progress: number) => progress)
      const { element, slot } = mountCollapse({ transition: easing }, warnHandler)

      slot().toggle()
      await vi.advanceTimersByTimeAsync(75)
      expect(parseFloat(element.style.height)).toBeGreaterThan(SCROLL_HEIGHT * 0.15)
      expect(parseFloat(element.style.height)).toBeLessThan(SCROLL_HEIGHT * 0.35)

      await vi.advanceTimersByTimeAsync(325)
      expect(element.style.height).toBe('')
      expect(easing).toHaveBeenCalled()
      expect(warnings).toEqual([])
    })

    it('accepts cubic-bezier points without warnings and eases with them', async () => {
      const { warnings, warnHandler } = collectWarnings()
      const { element, slot } = mountCollapse({ transition: [0.25, 0.1, 0.25, 1] }, warnHandler)

      slot().toggle()
      await vi.advanceTimersByTimeAsync(75)
      expect(element.style.overflow).toBe('hidden')
      expect(parseFloat(element.style.height)).toBeGreaterThan(SCROLL_HEIGHT * 0.15)

      await vi.advanceTimersByTimeAsync(325)
      expect(element.style.height).toBe('')
      expect(element.style.overflow).toBe('')
      expect(warnings).toEqual([])
    })

    it('accepts a ref to an easing function without warnings', async () => {
      const { warnings, warnHandler } = collectWarnings()
      const easing = vi.fn((progress: number) => progress)
      const { element, slot } = mountCollapse({ transition: ref(easing) }, warnHandler)

      slot().toggle()
      await vi.advanceTimersByTimeAsync(400)

      expect(element.style.height).toBe('')
      expect(easing).toHaveBeenCalled()
      expect(warnings).toEqual([])
    })
  })
})
