import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'
import { h, nextTick, type VNodeChild } from 'vue'
import Dialog from '../src/Dialog.vue'

enableAutoUnmount(afterEach)

const focusableContent = () => [
  h('p', 'Are you sure?'),
  h('button', { class: 'first' }, 'Cancel'),
  h('button', {
    class: 'autofocus',
    autofocus: true,
  }, 'Confirm'),
]

function mountDialog(props: Record<string, unknown> = {}, content: (slot: { close: (event: Event) => void }) => VNodeChild = focusableContent) {
  const wrapper = mount(Dialog, {
    props,
    slots: { default: content },
    attachTo: document.body,
  })

  return {
    wrapper,
    dialog: wrapper.element as HTMLDialogElement,
  }
}

describe('Dialog', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('rendering', () => {
    it('renders a dialog element with its implicit dialog role', () => {
      const { dialog } = mountDialog()

      expect(dialog.tagName).toBe('DIALOG')
      expect(dialog.hasAttribute('role')).toBe(false)
    })

    it('uses role alertdialog when alert is set', () => {
      const { dialog } = mountDialog({ alert: true })

      expect(dialog.getAttribute('role')).toBe('alertdialog')
    })

    it('reflects modal in aria-modal', () => {
      expect(mountDialog({ modal: true }).dialog.getAttribute('aria-modal')).toBe('true')
      expect(mountDialog({ modal: false }).dialog.getAttribute('aria-modal')).toBe('false')
    })

    it('is hidden and inert while not shown', () => {
      const { dialog } = mountDialog()

      expect(dialog.style.display).toBe('none')
      expect(dialog.hasAttribute('inert')).toBe(true)
    })

    it('is visible and not inert while shown', async () => {
      const { dialog } = mountDialog({ show: true })
      await flushPromises()

      expect(dialog.style.display).toBe('')
      expect(dialog.hasAttribute('inert')).toBe(false)
    })
  })

  describe('opening', () => {
    it('opens with showModal when modal', async () => {
      const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
      const show = vi.spyOn(HTMLDialogElement.prototype, 'show')

      mountDialog({
        show: true,
        modal: true,
      })
      await flushPromises()

      expect(showModal).toHaveBeenCalledTimes(1)
      expect(show).not.toHaveBeenCalled()
    })

    it('opens with show when not modal', async () => {
      const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
      const show = vi.spyOn(HTMLDialogElement.prototype, 'show')

      mountDialog({ show: true })
      await flushPromises()

      expect(show).toHaveBeenCalledTimes(1)
      expect(showModal).not.toHaveBeenCalled()
    })

    it('opens when show changes to true', async () => {
      const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
      const { wrapper, dialog } = mountDialog({ modal: true })
      await flushPromises()
      expect(showModal).not.toHaveBeenCalled()

      await wrapper.setProps({ show: true })
      await flushPromises()

      expect(showModal).toHaveBeenCalledTimes(1)
      expect(dialog.style.display).toBe('')
      expect(dialog.hasAttribute('inert')).toBe(false)
    })

    it('focuses the element with autofocus', async () => {
      const { wrapper } = mountDialog({
        show: true,
        modal: true,
      })
      await flushPromises()

      expect(document.activeElement).toBe(wrapper.get('.autofocus').element)
    })

    it('focuses the first focusable element without autofocus', async () => {
      const { wrapper } = mountDialog({
        show: true,
        modal: true,
      }, () => [
        h('p', 'Text'),
        h('a', { href: '#details' }, 'Details'),
        h('button', 'Close'),
      ])
      await flushPromises()

      expect(document.activeElement).toBe(wrapper.get('a').element)
    })

    it('warns when the dialog has no focusable element', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mountDialog({ show: true }, () => h('p', 'Text'))
      await flushPromises()

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Dialog without focussable element detected'))
    })

    it('moves the focus inside after the animationDuration', async () => {
      vi.useFakeTimers({
        toFake: [
          'setTimeout',
          'clearTimeout',
        ],
      })
      const { wrapper } = mountDialog({
        show: true,
        modal: true,
        animationDuration: 200,
      })
      const autofocus = wrapper.get('.autofocus').element

      await vi.advanceTimersByTimeAsync(150)
      expect(document.activeElement).not.toBe(autofocus)

      await vi.advanceTimersByTimeAsync(50)
      expect(document.activeElement).toBe(autofocus)
    })
  })

  describe('closing', () => {
    it('emits update:show false on cancel and prevents the native close', async () => {
      const { wrapper, dialog } = mountDialog({
        show: true,
        modal: true,
      })
      await flushPromises()

      const event = new Event('cancel', { cancelable: true })
      dialog.dispatchEvent(event)
      await nextTick()

      expect(event.defaultPrevented).toBe(true)
      expect(wrapper.emitted('update:show')).toEqual([[false]])
      expect(dialog.style.display).toBe('none')
    })

    it('emits update:show false through the slot close function', async () => {
      const { wrapper, dialog } = mountDialog({ show: true }, ({ close }) => h('button', { onClick: close }, 'Close'))
      await flushPromises()

      await wrapper.get('button').trigger('click')

      expect(wrapper.emitted('update:show')).toEqual([[false]])
      expect(dialog.style.display).toBe('none')
    })

    it('closes the dialog and emits close with the returnValue', async () => {
      const close = vi.spyOn(HTMLDialogElement.prototype, 'close')
      const { wrapper, dialog } = mountDialog({
        show: true,
        modal: true,
      })
      await flushPromises()
      dialog.returnValue = 'confirmed'

      await wrapper.setProps({ show: false })
      await flushPromises()

      expect(close).toHaveBeenCalledWith('confirmed')
      expect(dialog.open).toBe(false)
      expect(wrapper.emitted('close')).toEqual([['confirmed']])
      expect(dialog.style.display).toBe('none')
      expect(dialog.hasAttribute('inert')).toBe(true)
    })

    it('waits for the animationDuration before closing', async () => {
      vi.useFakeTimers({
        toFake: [
          'setTimeout',
          'clearTimeout',
        ],
      })
      const close = vi.spyOn(HTMLDialogElement.prototype, 'close')
      const { wrapper, dialog } = mountDialog({
        show: true,
        modal: true,
        animationDuration: 200,
      })
      await vi.advanceTimersByTimeAsync(200)
      dialog.returnValue = 'done'

      await wrapper.setProps({ show: false })
      await vi.advanceTimersByTimeAsync(150)
      expect(close).not.toHaveBeenCalled()
      expect(wrapper.emitted('close')).toBeUndefined()

      await vi.advanceTimersByTimeAsync(50)
      expect(close).toHaveBeenCalledWith('done')
      expect(wrapper.emitted('close')).toEqual([['done']])
    })
  })
})
