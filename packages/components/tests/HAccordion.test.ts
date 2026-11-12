import { enableAutoUnmount, mount } from '@vue/test-utils'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import { h, nextTick, ref } from 'vue'
import HAccordion from '../src/accordion/HAccordion.vue'
import HAccordionItem from '../src/accordion/HAccordionItem.vue'
import { useAnimationTimers } from './helpers'

interface ItemSlotProps {
  ref: (element: unknown) => void
  toggle: () => void
  isOpen: boolean
}

enableAutoUnmount(afterEach)

const renderItem = (props: Record<string, unknown>, index: number) => h(HAccordionItem, props, {
  default: (slot: ItemSlotProps) => h('article', [
    h('button', {
      'class': 'toggle',
      'aria-expanded': String(slot.isOpen),
      'onClick': slot.toggle,
    }, `Header ${index}`),
    h('section', { ref: slot.ref }, `Body ${index}`),
  ]),
})

function mountHAccordion(items: Record<string, unknown>[] = [{}, {}]) {
  const wrapper = mount(HAccordion, {
    slots: {
      default: () => items.map((item, index) => renderItem(item, index)),
    },
  })

  return {
    wrapper,
    toggle: (index: number) => wrapper.findAll('.toggle')[index].trigger('click'),
    expanded: () => wrapper.findAll('.toggle').map(button => button.attributes('aria-expanded')),
    bodies: () => wrapper.findAll('section').map(section => section.element as HTMLElement),
  }
}

describe('HAccordion', () => {
  beforeEach(() => {
    useAnimationTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders its items closed by default', () => {
    const { expanded, bodies } = mountHAccordion()

    expect(expanded()).toEqual(['false', 'false'])
    expect(bodies().map(body => body.style.display)).toEqual(['none', 'none'])
  })

  it('opens and closes an item', async () => {
    const { toggle, expanded, bodies } = mountHAccordion()

    await toggle(0)
    expect(expanded()).toEqual(['true', 'false'])

    await vi.advanceTimersByTimeAsync(400)
    expect(bodies()[0].style.display).toBe('')

    await toggle(0)
    expect(expanded()).toEqual(['false', 'false'])

    await vi.advanceTimersByTimeAsync(400)
    expect(bodies()[0].style.display).toBe('none')
  })

  it('keeps only one item open at a time', async () => {
    const { toggle, expanded, bodies } = mountHAccordion([{}, {}, {}])

    await toggle(0)
    await toggle(2)
    expect(expanded()).toEqual(['false', 'false', 'true'])

    await vi.advanceTimersByTimeAsync(400)
    expect(bodies().map(body => body.style.display)).toEqual(['none', 'none', ''])
  })

  it('starts an item open when initiallyClosed is false', () => {
    const { expanded, bodies } = mountHAccordion([{ initiallyClosed: false }, {}])

    expect(expanded()).toEqual(['true', 'false'])
    expect(bodies()[0].style.display).toBe('')
  })

  it('lets items open independently when not controlled', async () => {
    const { toggle, expanded } = mountHAccordion([{ controlled: false }, { controlled: false }])

    await toggle(0)
    await toggle(1)

    expect(expanded()).toEqual(['true', 'true'])
  })

  it('supports v-model:open on its items', async () => {
    const open = ref(false)
    const wrapper = mount(HAccordion, {
      slots: {
        default: () => [
          renderItem({
            'open': open.value,
            'onUpdate:open': (value: boolean) => {
              open.value = value
            },
          }, 0),
          renderItem({}, 1),
        ],
      },
    })
    const buttons = () => wrapper.findAll('.toggle')

    await buttons()[0].trigger('click')
    expect(open.value).toBe(true)

    await buttons()[1].trigger('click')
    expect(open.value).toBe(false)

    open.value = true
    await nextTick()
    expect(buttons().map(button => button.attributes('aria-expanded'))).toEqual(['true', 'false'])
  })
})

describe('HAccordionItem', () => {
  it('emits update:open only when toggled', async () => {
    const wrapper = mount(HAccordionItem, {
      props: { controlled: false },
      slots: {
        default: (slot: ItemSlotProps) => h('button', { onClick: slot.toggle }),
      },
    })

    await wrapper.get('button').trigger('click')
    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('update:open')).toEqual([[true], [false]])
  })
})
