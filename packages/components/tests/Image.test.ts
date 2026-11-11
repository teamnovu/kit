import { enableAutoUnmount, mount } from '@vue/test-utils'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import Image from '../src/Image.vue'

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = []

  callback: ResizeObserverCallback
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    FakeResizeObserver.instances.push(this)
  }

  trigger() {
    this.callback([], this as unknown as ResizeObserver)
  }
}

const image = {
  svg: '',
  src: 'original.jpg',
  small: 'small.jpg',
  normal: 'normal.jpg',
  large: 'large.jpg',
  alt: 'A kitten',
}

enableAutoUnmount(afterEach)

function mountImage(src: unknown, width = 0) {
  const wrapper = mount(Image, { props: { src } })
  const img = wrapper.find('img')

  if (img.exists()) {
    vi.spyOn(img.element, 'getBoundingClientRect').mockImplementation(() => ({ width }) as DOMRect)
  }

  return {
    wrapper,
    img: () => wrapper.get('img').element as HTMLImageElement,
    resize: (newWidth: number) => {
      width = newWidth
      FakeResizeObserver.instances.at(-1)?.trigger()
    },
  }
}

describe('Image', () => {
  beforeEach(() => {
    FakeResizeObserver.instances = []
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    vi.stubGlobal('devicePixelRatio', 1)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders a lazy img with the alt text', () => {
    const { img } = mountImage(image)

    expect(img().getAttribute('loading')).toBe('lazy')
    expect(img().getAttribute('alt')).toBe('A kitten')
  })

  it('observes the img and sets no src before the first resize', () => {
    const { img } = mountImage(image)

    expect(FakeResizeObserver.instances).toHaveLength(1)
    expect(FakeResizeObserver.instances[0].observe).toHaveBeenCalledWith(img())
    expect(img().hasAttribute('src')).toBe(false)
  })

  it('picks small up to 600px, normal up to 1000px and large above', () => {
    const { img, resize } = mountImage(image)

    resize(600)
    expect(img().getAttribute('src')).toBe('small.jpg')

    resize(601)
    expect(img().getAttribute('src')).toBe('normal.jpg')

    resize(1000)
    expect(img().getAttribute('src')).toBe('normal.jpg')

    resize(1001)
    expect(img().getAttribute('src')).toBe('large.jpg')

    resize(200)
    expect(img().getAttribute('src')).toBe('small.jpg')
  })

  it('multiplies the width by the devicePixelRatio', () => {
    vi.stubGlobal('devicePixelRatio', 2)
    const { img, resize } = mountImage(image)

    resize(300)
    expect(img().getAttribute('src')).toBe('small.jpg')

    resize(301)
    expect(img().getAttribute('src')).toBe('normal.jpg')

    resize(501)
    expect(img().getAttribute('src')).toBe('large.jpg')
  })

  it('uses a string src as is', () => {
    const { img, resize } = mountImage('kitten.jpg')

    expect(img().hasAttribute('alt')).toBe(false)

    resize(2000)
    expect(img().getAttribute('src')).toBe('kitten.jpg')
  })

  it('updates the src when the src prop changes', async () => {
    const { wrapper, img, resize } = mountImage(image)
    resize(800)

    await wrapper.setProps({
      src: {
        ...image,
        normal: 'other-normal.jpg',
      },
    })

    expect(img().getAttribute('src')).toBe('other-normal.jpg')
  })

  it('renders an svg inline without observing', () => {
    const { wrapper } = mountImage({
      ...image,
      svg: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="5"></circle></svg>',
    })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.element.getAttribute('alt')).toBe('A kitten')
    expect(wrapper.element.querySelector('svg circle')).not.toBeNull()
    expect(FakeResizeObserver.instances).toHaveLength(0)
  })

  it('renders an empty span without src', () => {
    const { wrapper } = mountImage('')

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.element.childNodes).toHaveLength(0)
    expect(FakeResizeObserver.instances).toHaveLength(0)
  })

  it('stops observing the img on unmount', () => {
    const { wrapper, img } = mountImage(image)
    const element = img()

    wrapper.unmount()

    expect(FakeResizeObserver.instances[0].unobserve).toHaveBeenCalledWith(element)
  })
})
