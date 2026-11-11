import { enableAutoUnmount, mount } from '@vue/test-utils'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import { h, nextTick, ref } from 'vue'
import Accordion from '../src/accordion/Accordion.vue'
import AccordionBody from '../src/accordion/AccordionBody.vue'
import AccordionHeader from '../src/accordion/AccordionHeader.vue'
import AccordionItem from '../src/accordion/AccordionItem.vue'
import { collectWarnings, useAnimationTimers } from './helpers'

enableAutoUnmount(afterEach)

interface MountOptions {
  accordion?: Record<string, unknown>
  items?: Record<string, unknown>[]
  header?: Record<string, unknown>
}

const renderItem = (props: Record<string, unknown>, header: Record<string, unknown>, index: number) => h(AccordionItem, props, {
  default: () => [
    h(AccordionHeader, header, { default: () => `Header ${index}` }),
    h(AccordionBody, null, { default: () => `Body ${index}` }),
  ],
})

function mountAccordion({
  accordion = { is: 'section' },
  items = [{}, {}],
  header = {},
}: MountOptions = {}) {
  const wrapper = mount(Accordion, {
    props: accordion,
    slots: {
      default: () => items.map((item, index) => renderItem(item, header, index)),
    },
    attachTo: document.body,
  })

  const nth = (selector: string, index: number) => wrapper.findAll(selector)[index].element as HTMLElement

  return {
    wrapper,
    item: (index: number) => nth('details', index),
    header: (index: number) => nth('[aria-controls]', index),
    body: (index: number) => nth('details > section', index),
  }
}

function click(element: HTMLElement) {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  })
  element.dispatchEvent(event)
  return event
}

function pressKey(element: HTMLElement, key: string) {
  element.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  }))
}

describe('Accordion', () => {
  beforeEach(() => {
    useAnimationTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('Accordion', () => {
    it('renders a section with role list by default', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { wrapper } = mountAccordion({ accordion: {} })

      expect(wrapper.element.tagName).toBe('SECTION')
      expect(wrapper.element.getAttribute('role')).toBe('list')
    })

    it('omits the role for ul, ol and menu', () => {
      for (const tag of ['ul', 'ol', 'menu']) {
        const { wrapper } = mountAccordion({ accordion: { is: tag } })

        expect(wrapper.element.tagName).toBe(tag.toUpperCase())
        expect(wrapper.element.hasAttribute('role')).toBe(false)
      }
    })

    it('keeps the role for other elements', () => {
      const { wrapper } = mountAccordion({ accordion: { is: 'div' } })

      expect(wrapper.element.getAttribute('role')).toBe('list')
    })

    it('renders its parts without Vue warnings', () => {
      const { warnings, warnHandler } = collectWarnings()

      mount(Accordion, {
        props: { is: 'section' },
        slots: { default: () => renderItem({}, {}, 0) },
        global: { config: { warnHandler } },
      })

      expect(warnings).toEqual([])
    })

    it('keeps only one item open at a time', async () => {
      const {
        item, header, body,
      } = mountAccordion({ items: [{}, {}, {}] })

      click(header(0))
      await vi.advanceTimersByTimeAsync(400)
      expect(header(0).getAttribute('aria-expanded')).toBe('true')

      click(header(1))
      await nextTick()
      expect(header(0).getAttribute('aria-expanded')).toBe('false')
      expect(header(1).getAttribute('aria-expanded')).toBe('true')
      expect(header(2).getAttribute('aria-expanded')).toBe('false')

      await vi.advanceTimersByTimeAsync(400)
      expect(item(0).hasAttribute('open')).toBe(false)
      expect(item(1).hasAttribute('open')).toBe(true)
      expect(item(2).hasAttribute('open')).toBe(false)
      expect(body(0).style.display).toBe('none')
      expect(body(1).style.display).toBe('')
      expect(body(2).style.display).toBe('none')
    })
  })

  describe('AccordionItem', () => {
    it('renders a closed details element with role listitem by default', () => {
      const { item, header } = mountAccordion()

      expect(item(0).tagName).toBe('DETAILS')
      expect(item(0).getAttribute('role')).toBe('listitem')
      expect(item(0).hasAttribute('open')).toBe(false)
      expect(header(0).getAttribute('aria-expanded')).toBe('false')
    })

    it('omits the role for li', () => {
      const { wrapper } = mountAccordion({
        accordion: { is: 'ul' },
        items: [{ is: 'li' }],
      })
      const li = wrapper.get('li').element

      expect(li.hasAttribute('role')).toBe(false)
    })

    it('sets the open attribute while open and while transitioning', async () => {
      const { item, header } = mountAccordion()

      click(header(0))
      await vi.advanceTimersByTimeAsync(100)
      expect(item(0).hasAttribute('open')).toBe(true)

      await vi.advanceTimersByTimeAsync(400)
      expect(item(0).hasAttribute('open')).toBe(true)

      click(header(0))
      await vi.advanceTimersByTimeAsync(100)
      expect(header(0).getAttribute('aria-expanded')).toBe('false')
      expect(item(0).hasAttribute('open')).toBe(true)

      await vi.advanceTimersByTimeAsync(400)
      expect(item(0).hasAttribute('open')).toBe(false)
    })

    it('starts open when initiallyClosed is false', () => {
      const { item, body } = mountAccordion({ items: [{ initiallyClosed: false }] })

      expect(item(0).hasAttribute('open')).toBe(true)
      expect(body(0).style.display).toBe('')
    })

    it('lets several items open when not controlled', async () => {
      const { header } = mountAccordion({ items: [{ controlled: false }, { controlled: false }] })

      click(header(0))
      await nextTick()
      click(header(1))
      await nextTick()

      expect(header(0).getAttribute('aria-expanded')).toBe('true')
      expect(header(1).getAttribute('aria-expanded')).toBe('true')
    })

    it('supports v-model:open', async () => {
      const open = ref(false)
      const wrapper = mount(Accordion, {
        props: { is: 'section' },
        slots: {
          default: () => renderItem({
            'open': open.value,
            'onUpdate:open': (value: boolean) => {
              open.value = value
            },
          }, {}, 0),
        },
      })
      const header = wrapper.get('summary')

      await header.trigger('click')
      expect(open.value).toBe(true)
      expect(header.attributes('aria-expanded')).toBe('true')

      open.value = false
      await nextTick()
      expect(header.attributes('aria-expanded')).toBe('false')

      open.value = true
      await nextTick()
      expect(header.attributes('aria-expanded')).toBe('true')
    })

    it('accepts an easing function and cubic-bezier points as transition without warnings', () => {
      const { warnings, warnHandler } = collectWarnings()

      mount(Accordion, {
        props: { is: 'section' },
        slots: {
          default: () => [
            renderItem({ transition: (progress: number) => progress }, {}, 0),
            renderItem({ transition: [0.25, 0.1, 0.25, 1] }, {}, 1),
          ],
        },
        global: { config: { warnHandler } },
      })

      expect(warnings).toEqual([])
    })

    it('uses the id prop for the body', () => {
      const { body, header } = mountAccordion({ items: [{ id: 'faq-1' }] })

      expect(body(0).id).toBe('faq-1')
      expect(header(0).getAttribute('aria-controls')).toBe('faq-1')
    })
  })

  describe('AccordionHeader', () => {
    it('renders a focusable summary that controls the body', () => {
      const { header, body } = mountAccordion()

      expect(header(0).tagName).toBe('SUMMARY')
      expect(header(0).hasAttribute('role')).toBe(false)
      expect(header(0).getAttribute('tabindex')).toBe('0')
      expect(header(0).getAttribute('aria-expanded')).toBe('false')
      expect(header(0).getAttribute('aria-pressed')).toBe('false')
      expect(header(0).getAttribute('aria-controls')).toBe(body(0).id)
    })

    it('renders role button for other elements', () => {
      const { header } = mountAccordion({ header: { is: 'div' } })

      expect(header(0).tagName).toBe('DIV')
      expect(header(0).getAttribute('role')).toBe('button')
    })

    it('toggles on click and prevents the native details toggle', async () => {
      const { header } = mountAccordion()

      const event = click(header(0))
      await nextTick()

      expect(event.defaultPrevented).toBe(true)
      expect(header(0).getAttribute('aria-expanded')).toBe('true')
      expect(header(0).getAttribute('aria-pressed')).toBe('true')

      click(header(0))
      await nextTick()

      expect(header(0).getAttribute('aria-expanded')).toBe('false')
    })

    it('toggles on Enter for non-button elements', async () => {
      const { header } = mountAccordion({ header: { is: 'div' } })

      pressKey(header(0), 'Enter')
      await nextTick()
      expect(header(0).getAttribute('aria-expanded')).toBe('true')

      pressKey(header(0), ' ')
      await nextTick()
      expect(header(0).getAttribute('aria-expanded')).toBe('true')
    })

    it('leaves Enter to the native behaviour of summary and button', async () => {
      for (const is of ['summary', 'button']) {
        const { header } = mountAccordion({ header: { is } })

        pressKey(header(0), 'Enter')
        await nextTick()

        expect(header(0).getAttribute('aria-expanded')).toBe('false')
      }
    })
  })

  describe('AccordionBody', () => {
    it('renders a section whose id is the collapse id', () => {
      const { body, header } = mountAccordion()

      expect(body(0).tagName).toBe('SECTION')
      expect(body(0).id).toMatch(/^[A-Za-z0-9_-]{21}$/)
      expect(body(0).id).toBe(header(0).getAttribute('aria-controls'))
      expect(body(0).id).not.toBe(body(1).id)
    })

    it('is the element that collapses', async () => {
      const { body, header } = mountAccordion()

      expect(body(0).style.display).toBe('none')

      click(header(0))
      await vi.advanceTimersByTimeAsync(100)
      expect(body(0).style.display).toBe('')
      expect(body(0).style.overflow).toBe('hidden')

      await vi.advanceTimersByTimeAsync(400)
      expect(body(0).style.overflow).toBe('')
      expect(body(0).style.display).toBe('')
    })
  })
})
