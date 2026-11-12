import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import {
  createApp, createSSRApp, defineComponent, h, inject, resolveDirective, withDirectives, type DirectiveBinding, type ObjectDirective,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import animations, { type Instance } from '../src'
import defaultAnimations from '../src/animations'
import {
  cleanup, intersect, setupBrowser,
} from './helpers'

const INJECTION_KEY = '@teamnovu/kit-animations'

const AnimatedBox = defineComponent({
  props: {
    value: {
      type: Object,
      default: undefined,
    },
  },

  setup(props) {
    const animate = resolveDirective('animate')!

    return () => withDirectives(h('div'), [[animate, props.value, 'in-bottom']])
  },
})

describe('plugin', () => {
  describe('on the client', () => {
    beforeEach(() => {
      setupBrowser()
      Object.assign(process, { client: true })
    })

    afterEach(() => {
      Reflect.deleteProperty(process, 'client')
      cleanup()
    })

    it('registers the v-animate directive', () => {
      const app = createApp(AnimatedBox)

      app.use(animations)

      expect(app.directive('animate')).toEqual({
        mounted: expect.any(Function),
        updated: expect.any(Function),
        unmounted: expect.any(Function),
      })
    })

    it('provides a started instance created with the options', () => {
      const app = createApp(AnimatedBox)

      app.use(animations, { defaultAnimationOptions: { duration: 800 } })

      const instance = app.runWithContext(() => inject<Instance>(INJECTION_KEY))
      expect(instance?.isStarted()).toBe(true)
      expect(instance?.context.defaultAnimationOptions.duration).toBe(800)
    })

    it('animates elements through the registered directive', () => {
      const app = createApp(AnimatedBox)
      const root = document.body.appendChild(document.createElement('div'))
      app.use(animations)
      app.mount(root)
      const instance = app.runWithContext(() => inject<Instance>(INJECTION_KEY))
      const element = root.firstElementChild!
      vi.runAllTimers()

      expect(Object.values(instance!.context.nodes).map(node => node.element)).toEqual([element])
      expect([...element.classList]).toEqual([defaultAnimations['in-bottom']])

      intersect(element)

      expect([...element.classList].sort()).toEqual([
        defaultAnimations['in-bottom'],
        defaultAnimations['in-bottom-in'],
      ])

      app.unmount()
    })
  })

  describe('on the server', () => {
    beforeEach(() => {
      Object.assign(process, { client: false })
    })

    afterEach(() => {
      Reflect.deleteProperty(process, 'client')
    })

    const getSSRProps = (options?: Parameters<typeof animations.install>[1]) => {
      const app = createSSRApp(AnimatedBox)
      app.use(animations, options)

      return (app.directive('animate') as ObjectDirective).getSSRProps!
    }

    it('renders the animation class', async () => {
      const app = createSSRApp(AnimatedBox)

      app.use(animations)

      expect(await renderToString(app)).toBe(`<div class="${defaultAnimations['in-bottom']}"></div>`)
    })

    it('maps the directive argument to the default animation class', () => {
      const binding = { arg: 'in-top' } as DirectiveBinding

      expect(getSSRProps()(binding, h('div'))).toEqual({ class: defaultAnimations['in-top'] })
    })

    it('maps the directive argument to classes from the options', () => {
      const binding = { arg: 'fade' } as DirectiveBinding

      expect(getSSRProps({ classes: { fade: 'fade-base' } })(binding, h('div'))).toEqual({ class: 'fade-base' })
    })

    it('prefers classes from the binding value', () => {
      const binding = {
        arg: 'in-bottom',
        value: { classes: { 'in-bottom': 'custom-in-bottom' } },
      } as DirectiveBinding

      expect(getSSRProps()(binding, h('div'))).toEqual({ class: 'custom-in-bottom' })
    })

    it('provides a context created with the options', () => {
      const app = createSSRApp(AnimatedBox)

      app.use(animations, { defaultAnimationOptions: { duration: 800 } })

      const instance = app.runWithContext(() => inject<Instance>(INJECTION_KEY))
      expect(instance?.context.defaultAnimationOptions).toEqual({
        delay: 0,
        duration: 800,
        easing: 'ease',
        repeatAnimation: true,
        cssVars: { offset: '50px' },
      })
    })
  })
})
