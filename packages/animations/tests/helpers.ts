import { mount, type VueWrapper } from '@vue/test-utils'
import { vi } from 'vitest'
import {
  defineComponent, h, withDirectives, type Directive, type PropType,
} from 'vue'

const wrappers: VueWrapper[] = []

export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []

  readonly elements = new Set<Element>()

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this)
  }

  observe(element: Element) {
    this.elements.add(element)
  }

  unobserve(element: Element) {
    this.elements.delete(element)
  }

  disconnect() {
    this.elements.clear()
  }

  takeRecords() {
    return []
  }
}

export class FakeResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

export function setViewport(width: number, height: number) {
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(width)
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(height)
}

export function setupBrowser() {
  const HappyDOMWindow = globalThis.Window

  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'],
  })

  FakeIntersectionObserver.instances = []
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
  vi.stubGlobal('Window', class {
    static [Symbol.hasInstance](value: unknown) {
      return value === globalThis || value instanceof HappyDOMWindow
    }
  })

  setViewport(1000, 800)
}

export function unmount(wrapper: VueWrapper) {
  wrappers.splice(wrappers.indexOf(wrapper), 1)
  wrapper.unmount()
}

export function cleanup() {
  for (const wrapper of wrappers.splice(0)) {
    wrapper.unmount()
  }

  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
}

export function intersect(element: Element, isIntersecting = true) {
  for (const observer of FakeIntersectionObserver.instances) {
    if (observer.elements.has(element)) {
      const entry = {
        target: element,
        isIntersecting,
      } as IntersectionObserverEntry

      observer.callback([entry], observer as unknown as IntersectionObserver)
    }
  }

  vi.runAllTimers()
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export function setRect(element: Element, rect: Rect) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    ...rect,
    x: rect.left,
    y: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => rect,
  })
}

export function mountAnimated(directive: Directive, arg: string, value?: Record<string, unknown>) {
  const Animated = defineComponent({
    props: {
      value: {
        type: Object as PropType<Record<string, unknown>>,
        default: undefined,
      },
    },

    setup(props) {
      return () => withDirectives(h('div'), [[directive, props.value, arg]])
    },
  })

  const wrapper = mount(Animated, {
    props: { value },
    attachTo: document.body,
  })

  wrappers.push(wrapper)

  return wrapper
}
