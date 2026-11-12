import { describe, expect, it } from 'vitest'
import { computed, ref, shallowRef } from 'vue'
import { deepUnwrapParams } from '../src/unwrapParams'

describe('deepUnwrapParams', () => {
  it('unwraps each section and each property of a section', () => {
    const bag = {
      params: shallowRef({ id: ref('1') }),
      queryParams: { page: computed(() => 2) },
      body: ref({ name: 'kit' }),
    }

    expect(deepUnwrapParams(bag)).toEqual({
      params: { id: '1' },
      queryParams: { page: 2 },
      body: { name: 'kit' },
    })
  })

  it('unwraps a bag that is a ref itself', () => {
    const bag = shallowRef({ params: { id: ref('1') } })

    expect(deepUnwrapParams(bag)).toEqual({ params: { id: '1' } })
  })

  it('keeps arrays, primitives and null sections as they are', () => {
    const bag = {
      params: null,
      queryParams: ref('page=2'),
      body: ref(['a', 'b']),
    }

    expect(deepUnwrapParams(bag)).toEqual({
      params: null,
      queryParams: 'page=2',
      body: ['a', 'b'],
    })
  })

  it('returns an empty bag for undefined', () => {
    expect(deepUnwrapParams(undefined)).toEqual({})
  })
})
