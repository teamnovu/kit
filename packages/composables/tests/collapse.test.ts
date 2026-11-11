import { enableAutoUnmount, mount } from '@vue/test-utils'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import {
  h, nextTick, ref, unref, type Ref,
} from 'vue'
import {
  useAccordion, useCollapse, useCollapseContext, type CollapseOptions,
} from '../src'
import { setupComponent, stubScrollSize, useAnimationTimers } from './helpers'

const SCROLL_HEIGHT = 200
const SCROLL_WIDTH = 120
const PX = /^\d+(\.\d+)?px$/

enableAutoUnmount(afterEach)

function mountCollapse(options?: CollapseOptions, withConsumer = !!options?.provide) {
  let isOpen!: Ref<boolean>
  let context: ReturnType<typeof useCollapseContext>
  const elementRef = ref<HTMLElement>()

  const Consumer = setupComponent(() => {
    context = useCollapseContext()
    return () => null
  })

  const wrapper = mount(setupComponent(() => {
    isOpen = useCollapse(elementRef, options)
    return () => h('div', { ref: elementRef }, withConsumer ? [h(Consumer)] : [])
  }))

  const element = wrapper.element as HTMLElement
  stubScrollSize(element, {
    height: SCROLL_HEIGHT,
    width: SCROLL_WIDTH,
  })

  return {
    wrapper,
    element,
    elementRef,
    isOpen,
    context: () => context,
  }
}

async function recordStyle(element: HTMLElement, property: 'height' | 'width', duration: number) {
  const values: string[] = []
  for (let elapsed = 0; elapsed < duration; elapsed += 4) {
    await vi.advanceTimersByTimeAsync(4)
    values.push(element.style[property])
  }
  return values
}

const pixels = (values: string[]) => values.filter(value => PX.test(value)).map(value => parseFloat(value))

describe('useCollapse', () => {
  beforeEach(() => {
    useAnimationTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('is open by default and leaves the element visible', () => {
      const { element, isOpen } = mountCollapse()

      expect(isOpen.value).toBe(true)
      expect(element.style.display).toBe('')
    })

    it('hides an initially closed element after mount', () => {
      const { element, isOpen } = mountCollapse({ initiallyClosed: true })

      expect(isOpen.value).toBe(false)
      expect(element.style.display).toBe('none')
    })
  })

  describe('opening', () => {
    it('animates the height in px with overflow hidden while opening', async () => {
      const { element, isOpen } = mountCollapse({ initiallyClosed: true })

      isOpen.value = true
      await vi.advanceTimersByTimeAsync(150)

      expect(element.style.display).toBe('')
      expect(element.style.overflow).toBe('hidden')
      expect(element.style.height).toMatch(PX)
      expect(parseFloat(element.style.height)).toBeGreaterThan(0)
      expect(parseFloat(element.style.height)).toBeLessThan(SCROLL_HEIGHT)
    })

    it('grows up to the full scrollHeight and then clears the inline styles', async () => {
      const { element, isOpen } = mountCollapse({ initiallyClosed: true })

      isOpen.value = true
      const values = await recordStyle(element, 'height', 500)
      const heights = pixels(values)

      expect(heights.length).toBeGreaterThan(1)
      expect(heights).toEqual([...heights].sort((a, b) => a - b))
      expect(heights.at(-1)).toBe(SCROLL_HEIGHT)
      expect(values.at(-1)).toBe('')
      expect(element.style.overflow).toBe('')
      expect(element.style.display).toBe('')
    })

    it('eases in and out over 300ms by default', async () => {
      const { element, isOpen } = mountCollapse({ initiallyClosed: true })

      isOpen.value = true
      await vi.advanceTimersByTimeAsync(75)
      expect(parseFloat(element.style.height)).toBeLessThan(SCROLL_HEIGHT * 0.15)

      await vi.advanceTimersByTimeAsync(150)
      expect(parseFloat(element.style.height)).toBeGreaterThan(SCROLL_HEIGHT * 0.85)

      await vi.advanceTimersByTimeAsync(25)
      expect(element.style.overflow).toBe('hidden')

      await vi.advanceTimersByTimeAsync(150)
      expect(element.style.height).toBe('')
      expect(element.style.overflow).toBe('')
    })

    it('respects a custom duration', async () => {
      const { element, isOpen } = mountCollapse({
        initiallyClosed: true,
        duration: 600,
      })

      isOpen.value = true
      await vi.advanceTimersByTimeAsync(450)
      expect(element.style.overflow).toBe('hidden')
      expect(parseFloat(element.style.height)).toBeLessThan(SCROLL_HEIGHT)

      await vi.advanceTimersByTimeAsync(250)
      expect(element.style.height).toBe('')
      expect(element.style.overflow).toBe('')
    })

    it('calls onStarted when the animation starts and onFinished after the inline styles are cleared', async () => {
      const stylesWhenFinished: string[] = []
      const onStarted = vi.fn()
      const onFinished = vi.fn()
      const { element, isOpen } = mountCollapse({
        initiallyClosed: true,
        onStarted,
        onFinished,
      })
      onFinished.mockImplementation(() => {
        stylesWhenFinished.push(element.style.height, element.style.overflow)
      })

      isOpen.value = true
      await vi.advanceTimersByTimeAsync(20)
      expect(onStarted).toHaveBeenCalledTimes(1)
      expect(onFinished).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(400)
      expect(onStarted).toHaveBeenCalledTimes(1)
      expect(onFinished).toHaveBeenCalledTimes(1)
      expect(stylesWhenFinished).toEqual(['', ''])
    })
  })

  describe('closing', () => {
    it('shrinks from the full scrollHeight to 0 and ends with display none', async () => {
      const onFinished = vi.fn()
      const { element, isOpen } = mountCollapse({ onFinished })

      isOpen.value = false
      await vi.advanceTimersByTimeAsync(150)
      expect(element.style.overflow).toBe('hidden')
      expect(element.style.display).toBe('')

      const values = await recordStyle(element, 'height', 350)
      const heights = pixels(values)

      expect(heights).toEqual([...heights].sort((a, b) => b - a))
      expect(heights.at(-1)).toBe(0)
      expect(element.style.height).toBe('')
      expect(element.style.overflow).toBe('')
      expect(element.style.display).toBe('none')
      expect(onFinished).toHaveBeenCalledTimes(1)
    })

    it('starts closing from the full scrollHeight', async () => {
      const { element, isOpen } = mountCollapse()

      isOpen.value = false
      const heights = pixels(await recordStyle(element, 'height', 500))

      expect(Math.max(...heights)).toBe(SCROLL_HEIGHT)
    })
  })

  describe('dimension', () => {
    it('animates the width using scrollWidth when dimension is width', async () => {
      const { element, isOpen } = mountCollapse({
        initiallyClosed: true,
        dimension: 'width',
      })

      isOpen.value = true
      await vi.advanceTimersByTimeAsync(150)
      expect(element.style.width).toMatch(PX)
      expect(element.style.height).toBe('')

      const widths = pixels(await recordStyle(element, 'width', 350))

      expect(widths.at(-1)).toBe(SCROLL_WIDTH)
      expect(element.style.width).toBe('')
      expect(element.style.height).toBe('')
    })
  })

  describe('id', () => {
    it('uses the id option', () => {
      const { context } = mountCollapse({
        id: 'my-collapse',
        provide: true,
      })

      expect(context()?.id).toBe('my-collapse')
    })

    it('generates a unique 21 character nanoid when no id is given', () => {
      const first = mountCollapse({ provide: true }).context()?.id
      const second = mountCollapse({ provide: true }).context()?.id

      expect(first).toMatch(/^[A-Za-z0-9_-]{21}$/)
      expect(second).toMatch(/^[A-Za-z0-9_-]{21}$/)
      expect(first).not.toBe(second)
    })
  })

  describe('provide', () => {
    it('provides id, toggle and ref to descendants when provide is true', () => {
      const {
        context, element, elementRef, isOpen,
      } = mountCollapse({
        id: 'provided',
        provide: true,
      })

      expect(context()?.id).toBe('provided')
      expect(context()?.toggle).toBe(isOpen)
      expect(context()?.ref).toBe(elementRef)
      expect(unref(context()?.ref)).toBe(element)
    })

    it('opens and closes through the provided toggle', async () => {
      const { context, isOpen } = mountCollapse({ provide: true })

      context()!.toggle.value = false
      await nextTick()

      expect(isOpen.value).toBe(false)
    })

    it('provides nothing without provide', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { context } = mountCollapse(undefined, true)

      expect(context()).toBeUndefined()
    })
  })

  describe('controlled', () => {
    function mountAccordion(controlled: boolean) {
      const states: Ref<boolean>[] = []
      const showFirst = ref(true)

      const item = (initiallyClosed: boolean) => setupComponent(() => {
        const element = ref<HTMLElement>()
        states.push(useCollapse(element, {
          controlled,
          initiallyClosed,
        }))
        return () => h('div', { ref: element })
      })
      const First = item(false)
      const Second = item(true)

      mount(setupComponent(() => {
        useAccordion({ provide: true })
        return () => [
          showFirst.value ? h(First) : null,
          h(Second),
        ]
      }))

      return {
        states,
        showFirst,
      }
    }

    it('registers with the collapse controller', async () => {
      const { states: [first, second] } = mountAccordion(true)

      second.value = true
      await nextTick()

      expect(first.value).toBe(false)
      expect(second.value).toBe(true)
    })

    it('unregisters from the collapse controller on unmount', async () => {
      const { states: [first, second], showFirst } = mountAccordion(true)

      showFirst.value = false
      await nextTick()
      second.value = true
      await nextTick()

      expect(first.value).toBe(true)
      expect(second.value).toBe(true)
    })

    it('ignores the collapse controller without controlled', async () => {
      const { states: [first, second] } = mountAccordion(false)

      second.value = true
      await nextTick()

      expect(first.value).toBe(true)
      expect(second.value).toBe(true)
    })
  })
})
