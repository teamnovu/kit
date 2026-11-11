import { enableAutoUnmount, mount } from '@vue/test-utils'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'
import { h, nextTick, ref } from 'vue'
import { useAccordion, useCollapseController } from '../src'
import { setupComponent } from './helpers'

enableAutoUnmount(afterEach)

describe('useAccordion', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('closes the other controlled refs when one opens', async () => {
    const control = useAccordion()
    const first = ref(false)
    const second = ref(true)
    const third = ref(false)
    control('first', first)
    control('second', second)
    control('third', third)
    await nextTick()

    first.value = true
    await nextTick()

    expect(first.value).toBe(true)
    expect(second.value).toBe(false)
    expect(third.value).toBe(false)

    third.value = true
    await nextTick()

    expect(first.value).toBe(false)
    expect(second.value).toBe(false)
    expect(third.value).toBe(true)
  })

  it('leaves only the last registered open ref open', () => {
    const control = useAccordion()
    const first = ref(true)
    const second = ref(true)
    const third = ref(true)

    control('first', first)
    control('second', second)
    control('third', third)

    expect(first.value).toBe(false)
    expect(second.value).toBe(false)
    expect(third.value).toBe(true)
  })

  it('allows every ref to be closed', async () => {
    const control = useAccordion()
    const first = ref(true)
    const second = ref(false)
    control('first', first)
    control('second', second)

    first.value = false
    await nextTick()

    expect(first.value).toBe(false)
    expect(second.value).toBe(false)
  })

  it('returns an unregister function from control', async () => {
    const control = useAccordion()
    const first = ref(true)
    const second = ref(false)
    const unregister = control('first', first)
    control('second', second)
    await nextTick()

    expect(unregister).toBeTypeOf('function')

    unregister()
    await nextTick()
    second.value = true
    await nextTick()

    expect(first.value).toBe(true)
    expect(second.value).toBe(true)
  })

  it('keeps the controlled state in the record passed as value', async () => {
    const state = ref<Record<string, boolean>>({})
    const control = useAccordion({ value: state })
    const first = ref(true)
    const second = ref(false)
    control('first', first)
    control('second', second)

    expect({ ...state.value }).toEqual({
      first: true,
      second: false,
    })

    await nextTick()
    second.value = true
    await nextTick()

    expect(first.value).toBe(false)
    expect({ ...state.value }).toEqual({
      first: false,
      second: true,
    })
  })

  describe('provide', () => {
    function injectController(provide: boolean) {
      let controller: ReturnType<typeof useCollapseController>

      const Child = setupComponent(() => {
        controller = useCollapseController()
        return () => null
      })

      mount(setupComponent(() => {
        useAccordion({ provide })
        return () => h(Child)
      }))

      return controller
    }

    it('provides its control function as collapse controller when provide is true', async () => {
      const controller = injectController(true)
      const first = ref(true)
      const second = ref(false)

      controller!.control('first', first)
      controller!.control('second', second)
      await nextTick()
      second.value = true
      await nextTick()

      expect(first.value).toBe(false)
      expect(second.value).toBe(true)
    })

    it('provides nothing without provide', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})

      expect(injectController(false)).toBeUndefined()
    })
  })
})
