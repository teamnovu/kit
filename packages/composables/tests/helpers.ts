import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import { defineComponent, type RenderFunction } from 'vue'

export function useAnimationTimers() {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
      'Date',
    ],
  })
}

export function stubScrollSize(element: HTMLElement, size: {
  height: number
  width: number
}) {
  Object.defineProperties(element, {
    scrollHeight: {
      configurable: true,
      get: () => size.height,
    },
    scrollWidth: {
      configurable: true,
      get: () => size.width,
    },
  })
}

export const setupComponent = (setup: () => RenderFunction) => defineComponent({ setup })

export function withSetup<T>(composable: () => T) {
  let result!: T
  const wrapper = mount(setupComponent(() => {
    result = composable()
    return () => null
  }))

  return {
    result,
    wrapper,
  }
}

export function scrollWindowTo(y: number) {
  document.documentElement.scrollTop = y
  window.dispatchEvent(new Event('scroll'))
}
