import { enableAutoUnmount, mount } from '@vue/test-utils'
import {
  afterEach, describe, expect, it,
} from 'vitest'
import AccessibleComponent from '../src/AccessibleComponent.vue'

enableAutoUnmount(afterEach)

function mountAccessible(props: Record<string, unknown>) {
  return mount(AccessibleComponent, {
    props,
    slots: { default: () => 'Content' },
  })
}

describe('AccessibleComponent', () => {
  it('renders the given element with the role and slot content', () => {
    const wrapper = mountAccessible({
      is: 'div',
      role: 'button',
    })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.text()).toBe('Content')
  })

  it('omits the role for elements listed in omitRoleFor', () => {
    const omitted = mountAccessible({
      is: 'button',
      role: 'button',
      omitRoleFor: ['button', 'summary'],
    })
    const kept = mountAccessible({
      is: 'span',
      role: 'button',
      omitRoleFor: ['button', 'summary'],
    })

    expect(omitted.element.tagName).toBe('BUTTON')
    expect(omitted.attributes('role')).toBeUndefined()
    expect(kept.attributes('role')).toBe('button')
  })

  it('omits the role when the omitRoleFor function returns true', () => {
    const omitted = mountAccessible({
      is: 'li',
      role: 'listitem',
      omitRoleFor: (is: string) => is === 'li',
    })
    const kept = mountAccessible({
      is: 'div',
      role: 'listitem',
      omitRoleFor: (is: string) => is === 'li',
    })

    expect(omitted.attributes('role')).toBeUndefined()
    expect(kept.attributes('role')).toBe('listitem')
  })
})
