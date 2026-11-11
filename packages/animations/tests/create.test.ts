import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import { create } from '../src'
import defaultAnimations from '../src/animations'
import {
  cleanup, FakeIntersectionObserver, intersect, mountAnimated, setRect, setupBrowser, unmount,
} from './helpers'

const ID_PATTERN = /^jk-animate-id-[A-Za-z0-9_-]{21}$/

const cssVar = (element: Element, animation: string, property: string) => (element as HTMLElement).style
  .getPropertyValue(`--jk-animation-${animation}-${property}`)

describe('create', () => {
  beforeEach(setupBrowser)
  afterEach(cleanup)

  describe('element ids', () => {
    it('assigns a jk-animate-id with a 21 character nanoid to the element', () => {
      const { instance, vAnimate } = create()

      const wrapper = mountAnimated(vAnimate, 'in-bottom')

      const ids = Object.keys(instance.context.nodes)
      expect(ids).toHaveLength(1)
      expect(ids[0]).toMatch(ID_PATTERN)
      expect(instance.context.nodes[ids[0]].id).toBe(ids[0])
      expect(instance.context.nodes[ids[0]].element).toBe(wrapper.element)
    })

    it('assigns a different id to each element', () => {
      const { instance, vAnimate } = create()

      mountAnimated(vAnimate, 'in-bottom')
      mountAnimated(vAnimate, 'in-bottom')

      const ids = Object.keys(instance.context.nodes)
      expect(ids).toHaveLength(2)
      expect(ids[0]).not.toBe(ids[1])
    })

    it('keeps the id when the directive updates', async () => {
      const { instance, vAnimate } = create()
      const wrapper = mountAnimated(vAnimate, 'in-bottom', { duration: 500 })
      const [id] = Object.keys(instance.context.nodes)

      await wrapper.setProps({ value: { duration: 900 } })

      expect(Object.keys(instance.context.nodes)).toEqual([id])
      expect(instance.context.nodes[id].element).toBe(wrapper.element)
      expect(instance.context.nodes[id].animations['in-bottom'].duration).toBe(900)
    })
  })

  describe('context', () => {
    it('uses the default animation options', () => {
      const { instance } = create()

      expect(instance.context.defaultAnimationOptions).toEqual({
        delay: 0,
        duration: 300,
        easing: 'ease',
        repeatAnimation: true,
        cssVars: { offset: '50px' },
      })
      expect(instance.context.threshold).toBe(0)
    })

    it('merges custom default animation options and css variables', () => {
      const { instance } = create({
        threshold: 20,
        defaultAnimationOptions: {
          duration: 600,
          cssVars: { scale: '0.9' },
        },
      })

      expect(instance.context.defaultAnimationOptions).toEqual({
        delay: 0,
        duration: 600,
        easing: 'ease',
        repeatAnimation: true,
        cssVars: {
          offset: '50px',
          scale: '0.9',
        },
      })
      expect(instance.context.threshold).toBe(20)
    })

    it('extends the default animation classes from the css module', () => {
      const { instance } = create({ classes: { fade: 'my-fade' } })

      expect(instance.context.classes).toEqual({
        ...defaultAnimations,
        fade: 'my-fade',
      })
    })
  })

  describe('default animation classes', () => {
    it('come from the css module', () => {
      expect(Object.keys(defaultAnimations).sort()).toEqual([
        'in-bottom',
        'in-bottom-in',
        'in-bottom-out-bottom',
        'in-bottom-out-top',
        'in-left',
        'in-left-in',
        'in-left-out',
        'in-right',
        'in-right-in',
        'in-right-out',
        'in-top',
        'in-top-in',
        'in-top-out-bottom',
        'in-top-out-top',
      ])
    })
  })

  describe('css variables', () => {
    it('sets the default transition variables on the element', () => {
      const { vAnimate, start } = create()
      start()

      const wrapper = mountAnimated(vAnimate, 'in-bottom')
      vi.runAllTimers()

      expect(cssVar(wrapper.element, 'in-bottom', 'duration')).toBe('0.3s')
      expect(cssVar(wrapper.element, 'in-bottom', 'delay')).toBe('0s')
      expect(cssVar(wrapper.element, 'in-bottom', 'easing')).toBe('ease')
      expect(cssVar(wrapper.element, 'in-bottom', 'offset')).toBe('50px')
    })

    it('renders numeric durations and delays in seconds', () => {
      const { vAnimate, start } = create()
      start()

      const wrapper = mountAnimated(vAnimate, 'in-top', {
        duration: 1200,
        delay: 150,
        easing: 'linear',
        cssVars: { offset: '20px' },
      })
      vi.runAllTimers()

      expect(cssVar(wrapper.element, 'in-top', 'duration')).toBe('1.2s')
      expect(cssVar(wrapper.element, 'in-top', 'delay')).toBe('0.15s')
      expect(cssVar(wrapper.element, 'in-top', 'easing')).toBe('linear')
      expect(cssVar(wrapper.element, 'in-top', 'offset')).toBe('20px')
    })

    it('applies instance defaults', () => {
      const { vAnimate, start } = create({
        defaultAnimationOptions: {
          duration: 2000,
          cssVars: { scale: 2 },
        },
      })
      start()

      const wrapper = mountAnimated(vAnimate, 'in-bottom')
      vi.runAllTimers()

      expect(cssVar(wrapper.element, 'in-bottom', 'duration')).toBe('2s')
      expect(cssVar(wrapper.element, 'in-bottom', 'offset')).toBe('50px')
      expect(cssVar(wrapper.element, 'in-bottom', 'scale')).toBe('2')
    })
  })

  describe('classes', () => {
    it('adds the animation class once mounted', () => {
      const { vAnimate, start } = create()
      start()

      const wrapper = mountAnimated(vAnimate, 'in-bottom')
      vi.runAllTimers()

      expect([...wrapper.element.classList]).toEqual([defaultAnimations['in-bottom']])
    })

    it('adds the in class while the element intersects and removes it when it leaves', () => {
      const { vAnimate, start } = create()
      start()
      const wrapper = mountAnimated(vAnimate, 'in-bottom')
      setRect(wrapper.element, {
        top: 300,
        left: 0,
        width: 500,
        height: 100,
      })
      vi.runAllTimers()

      intersect(wrapper.element)

      expect([...wrapper.element.classList].sort()).toEqual([
        defaultAnimations['in-bottom'],
        defaultAnimations['in-bottom-in'],
      ])

      intersect(wrapper.element, false)

      expect([...wrapper.element.classList]).toEqual([defaultAnimations['in-bottom']])
    })

    it('moves an element from its out position to in', () => {
      const { vAnimate, start } = create({ threshold: 100 })
      const wrapper = mountAnimated(vAnimate, 'in-bottom')
      start()
      setRect(wrapper.element, {
        top: 750,
        left: 0,
        width: 500,
        height: 100,
      })

      intersect(wrapper.element)

      expect([...wrapper.element.classList].sort()).toEqual([
        defaultAnimations['in-bottom'],
        defaultAnimations['in-bottom-out-bottom'],
      ])

      setRect(wrapper.element, {
        top: 300,
        left: 0,
        width: 500,
        height: 100,
      })
      intersect(wrapper.element)

      expect([...wrapper.element.classList].sort()).toEqual([
        defaultAnimations['in-bottom'],
        defaultAnimations['in-bottom-in'],
      ])
    })

    it('applies custom classes for custom animations', () => {
      const { vAnimate, start } = create({
        classes: {
          'fade': 'fade-base',
          'fade-in': 'fade-visible',
        },
      })
      start()
      const wrapper = mountAnimated(vAnimate, 'fade')
      vi.runAllTimers()

      intersect(wrapper.element)

      expect([...wrapper.element.classList].sort()).toEqual(['fade-base', 'fade-visible'])
    })

    it('keeps the in class after leaving when repeatAnimation is false', () => {
      const { vAnimate, start } = create()
      start()
      const wrapper = mountAnimated(vAnimate, 'in-bottom', { repeatAnimation: false })
      vi.runAllTimers()

      intersect(wrapper.element)
      intersect(wrapper.element, false)

      expect([...wrapper.element.classList].sort()).toEqual([
        defaultAnimations['in-bottom'],
        defaultAnimations['in-bottom-in'],
      ])
    })

    it('observes the element with an IntersectionObserver', () => {
      const { vAnimate } = create()

      const wrapper = mountAnimated(vAnimate, 'in-bottom')

      expect(FakeIntersectionObserver.instances).toHaveLength(1)
      expect([...FakeIntersectionObserver.instances[0].elements]).toEqual([wrapper.element])
    })

    it('stops observing the element when it is unmounted', () => {
      const { instance, vAnimate } = create()
      const wrapper = mountAnimated(vAnimate, 'in-bottom')

      unmount(wrapper)

      expect(instance.context.nodes).toEqual({})
      expect(FakeIntersectionObserver.instances[0].elements.size).toBe(0)
    })
  })

  describe('start', () => {
    it('is idempotent until stopped', () => {
      const addEventListener = vi.spyOn(window, 'addEventListener')
      const { instance, start, stop } = create()

      const destroy = start()

      expect(start()).toBe(destroy)
      expect(instance.isStarted()).toBe(true)
      expect(addEventListener.mock.calls.filter(([type]) => type === 'scroll')).toHaveLength(1)

      stop()

      expect(instance.isStarted()).toBe(false)
      expect(start()).not.toBe(destroy)
    })

    it('applies animations only once started', () => {
      const { vAnimate, start } = create()
      const wrapper = mountAnimated(vAnimate, 'in-bottom')
      vi.runAllTimers()

      expect([...wrapper.element.classList]).toEqual([])

      start()
      intersect(wrapper.element)

      expect([...wrapper.element.classList].sort()).toEqual([
        defaultAnimations['in-bottom'],
        defaultAnimations['in-bottom-in'],
      ])
    })
  })
})
