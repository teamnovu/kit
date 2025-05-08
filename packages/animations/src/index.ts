import type { App, Directive, DirectiveBinding } from 'vue'
import { nanoid } from 'nanoid'
import createInstance, { createContext } from './impl'
import type { Animation, Options, ScrollContainer } from './types'
import defaultAnimations from './animations'

export * from './types'

interface CreateResult {
  instance: ReturnType<typeof createInstance>
  vAnimate: Directive
  start: (el?: ScrollContainer) => () => void
  stop: () => void
}

export { default as createTimeline } from './timeline'

export const create = (options: Options = {}): CreateResult => {
  const instance = createInstance({
    ...options,
    classes: {
      ...defaultAnimations,
      ...options.classes,
    },
  })

  const setupAnimation = async (
    action: 'update' | 'mount',
    element: any,
    bind: DirectiveBinding<Animation>,
  ) => {
    const id = element.__jkAnimateId || `jk-animate-id-${nanoid()}`

    element.__jkAnimateId = id

    const animationName = bind.arg ?? bind.value?.name
    const animationOptions = bind.value

    if (!animationName) {
      throw new Error('Missing argument to v-animate: Animation name')
    }

    const inst = bind.value?.instance ?? instance

    const node = inst.context.nodes[id] ?? {
      id,
      animations: [],
      element,
      caches: {},
    }

    const animation: Animation = {
      ...animationOptions,
      node,
      instance: inst,
      name: animationName,
    }

    if (action === 'mount') {
      if (animation.timeline) {
        animation.timeline.addAnimation(animation)
      }

      inst.addAnimation(node, animation)

      if (!inst.context.nodes[id]) {
        inst.addNode(node)
      }
    } else {
      const existingAnimation = inst.context.nodes[id]?.animations[animationName]

      if (existingAnimation) {
        inst.context.nodes[id].animations[animationName] = {
          ...existingAnimation,
          ...animationOptions,
        }
      }
    }

    if (inst.isStarted()) {
      inst.applyAnimations(node)
    }
  }

  return {
    instance,
    start: instance.start,
    stop: instance.stop,
    vAnimate: {
      mounted: (element, bind) => setupAnimation('mount', element, bind),
      updated: (element, bind) => setupAnimation('update', element, bind),
      unmounted(element) {
        instance.removeNode(element.__jkAnimateId)
      },
    },
  }
}

export default {
  install(app: App, options?: Options) {
    if (typeof process === 'undefined' || process.client) {
      const { vAnimate, instance, start } = create(options)

      start()

      app.directive('animate', vAnimate)

      app.provide('@teamnovu/kit-animations', instance)
    } else {
      const noop = (..._args: unknown[]) => undefined

      app.directive('animate', {
        getSSRProps(bind: DirectiveBinding<Animation>) {
          const classes = {
            ...defaultAnimations,
            ...options?.classes,
            ...bind.value?.classes,
          }

          return {
            class: bind.arg && classes[bind.arg],
          }
        },
      })

      app.provide('@teamnovu/kit-animations', {
        context: createContext(options ?? {}),
        isStarted: false,
        start: noop,
        addAnimation: noop,
        removeNode: noop,
        removeAnimation: noop,
        removeAnimations: noop,
        stop: noop,
        addNode: noop,
        applyAnimations: noop,
      })
    }
  },
}
