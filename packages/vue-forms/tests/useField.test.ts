import { describe, it, expect } from 'vitest'
import { watch, ref, nextTick, effectScope } from 'vue'
import { useField } from '../src/composables/useField'
import { cloneDeep } from 'lodash-es'

describe('useField', () => {
  it('should initialize field with path', () => {
    const field = useField({ path: 'name' })

    expect(field.path.value).toBe('name')
    expect(field.touched.value).toBe(false)
    expect(field.dirty.value).toBe(false)
  })

  it('should initialize field with value and initial value', () => {
    const field = useField({
      path: 'name',
      value: 'John',
      initialValue: 'John',
    })

    expect(field.data.value).toBe('John')
    expect(field.initialValue.value).toBe('John')
    expect(field.dirty.value).toBe(false)
  })

  it('should detect dirty state when value changes', () => {
    const field = useField({
      path: 'name',
      value: 'John',
      initialValue: 'John',
    })

    expect(field.dirty.value).toBe(false)

    field.setData('Jane')
    expect(field.data.value).toBe('Jane')
    expect(field.dirty.value).toBe(true)
  })

  it('should handle reactive initial value', async () => {
    const initialValue = ref('John')
    const field = useField({
      path: 'name',
      initialValue,
    })

    expect(field.initialValue.value).toBe('John')

    initialValue.value = 'Jane'
    await nextTick()

    expect(field.initialValue.value).toBe('Jane')
  })

  it('should handle touched state', () => {
    const field = useField({ path: 'name' })

    expect(field.touched.value).toBe(false)

    field.onBlur()
    expect(field.touched.value).toBe(true)
  })

  it('should handle errors', () => {
    const field = useField({
      path: 'name',
      errors: ['Required field'],
    })

    expect(field.errors.value).toEqual(['Required field'])

    field.setErrors(['New error'])
    expect(field.errors.value).toEqual(['New error'])

    field.clearErrors()
    expect(field.errors.value).toEqual([])
  })

  it('should handle reactive errors', async () => {
    const errors = ref(['Initial error'])
    const field = useField({
      path: 'name',
      errors,
    })

    expect(field.errors.value).toEqual(['Initial error'])

    errors.value = ['Updated error']
    await nextTick()

    expect(field.errors.value).toEqual(['Updated error'])
  })

  it('should reset field to initial state', () => {
    const field = useField({
      path: 'name',
      value: 'John',
      initialValue: 'Initial',
    })

    field.setData('Modified')
    field.onBlur()
    field.setErrors(['Error'])

    expect(field.data.value).toBe('Modified')
    expect(field.touched.value).toBe(true)
    expect(field.errors.value).toEqual(['Error'])
    expect(field.dirty.value).toBe(true)

    field.reset()

    expect(field.data.value).toBe('Initial')
    expect(field.touched.value).toBe(false)
    expect(field.errors.value).toEqual([])
    expect(field.dirty.value).toBe(false)
  })

  it('should handle complex object values', () => {
    const initialValue = { nested: { value: 'test' } }
    const field = useField({
      path: 'complex',
      value: initialValue,
      initialValue,
    })

    expect(field.data.value).toEqual(initialValue)
    expect(field.dirty.value).toBe(false)

    field.setData({ nested: { value: 'changed' } })
    expect(field.dirty.value).toBe(true)
  })

  it('should handle array values', () => {
    const initialValue = ['a', 'b', 'c']
    const field = useField({
      path: 'array',
      value: initialValue,
      initialValue,
    })

    expect(field.data.value).toEqual(initialValue)
    expect(field.dirty.value).toBe(false)

    field.setData(['a', 'b', 'c', 'd'])
    expect(field.dirty.value).toBe(true)
  })

  it('should trigger reactivity', { timeout: 500 }, () => new Promise((resolve) => {
    effectScope().run(() => {
      const initialValue = ref(['a', 'b', 'c'])
      const field = useField({
        path: 'array',
        value: initialValue,
        initialValue: cloneDeep(initialValue.value),
      })

      expect(field.data.value).toEqual(initialValue.value)
      expect(field.dirty.value).toBe(false)

      watch(initialValue, () => {
        resolve(true)
      }, {
        once: true,
        deep: true,
      })

      field.setData(['a', 'b', 'c', 'd'])
      expect(field.dirty.value).toBe(true)
    })
  }))

  it('it should set the initial value if the field is not dirty', { timeout: 500 }, () => {
    const field = useField({
      initialValue: 'foo',
      value: 'foo',
      path: 'name',
    })

    expect(field.data.value).toBe('foo')
    expect(field.path.value).toBe('name')
    expect(field.touched.value).toBe(false)
    expect(field.dirty.value).toBe(false)

    field.setInitialData('bar')

    expect(field.initialValue.value).toBe('bar')
    expect(field.data.value).toBe('bar')
  })

  it('it should set the initial value but not the data if the field is dirty', { timeout: 500 }, () => {
    const field = useField({
      initialValue: 'foo',
      value: 'foo',
      path: 'name',
    })

    expect(field.data.value).toBe('foo')
    expect(field.path.value).toBe('name')
    expect(field.touched.value).toBe(false)
    expect(field.dirty.value).toBe(false)

    field.data.value = 'modified'

    field.setInitialData('bar')

    expect(field.initialValue.value).toBe('bar')
    expect(field.data.value).toBe('modified')
  })
})
