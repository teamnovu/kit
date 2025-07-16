import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { useField } from '../src/composables/useField'

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

    expect(field.value.value).toBe('John')
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

    field.setValue('Jane')
    expect(field.value.value).toBe('Jane')
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

    field.setValue('Modified')
    field.onBlur()
    field.setErrors(['Error'])

    expect(field.value.value).toBe('Modified')
    expect(field.touched.value).toBe(true)
    expect(field.errors.value).toEqual(['Error'])
    expect(field.dirty.value).toBe(true)

    field.reset()

    expect(field.value.value).toBe('Initial')
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

    expect(field.value.value).toEqual(initialValue)
    expect(field.dirty.value).toBe(false)

    field.setValue({ nested: { value: 'changed' } })
    expect(field.dirty.value).toBe(true)
  })

  it('should handle array values', () => {
    const initialValue = ['a', 'b', 'c']
    const field = useField({
      path: 'array',
      value: initialValue,
      initialValue,
    })

    expect(field.value.value).toEqual(initialValue)
    expect(field.dirty.value).toBe(false)

    field.setValue(['a', 'b', 'c', 'd'])
    expect(field.dirty.value).toBe(true)
  })
})
