import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { FieldRegistry, useFieldRegistry } from '../src/composables/useFieldRegistry'
import { useFormState } from '../src/composables/useFormState'

describe('useFormState', () => {
  it('should detect dirty state when form data changes', () => {
    const initialData = {
      name: 'John',
      age: 30,
    }
    const formData = reactive({ ...initialData })
    const fields = {} as FieldRegistry<typeof initialData>

    const formState = useFormState({
      formData,
      initialData,
    }, fields)

    expect(formState.isDirty.value).toBe(false)

    formData.name = 'Jane'
    expect(formState.isDirty.value).toBe(true)
  })

  it('should not be dirty when data equals initial data', () => {
    const initialData = {
      name: 'John',
      age: 30,
    }
    const formData = reactive({ ...initialData })
    const fields = {} as FieldRegistry<typeof initialData>

    const formState = useFormState({
      formData,
      initialData,
    }, fields)

    expect(formState.isDirty.value).toBe(false)

    formData.name = 'Jane'
    expect(formState.isDirty.value).toBe(true)

    formData.name = 'John' // Back to initial
    expect(formState.isDirty.value).toBe(false)
  })

  it('should detect touched state when any field is touched', () => {
    const data = {
      name: 'John',
      email: 'john@example.com',
    }
    const formData = reactive(data)
    const fields = useFieldRegistry({
      formData,
      initialData: data,
    })

    const nameField = fields.defineField({ path: 'name' })
    fields.defineField({ path: 'email' })

    const formState = useFormState({
      formData,
      initialData: {
        name: 'John',
        email: 'john@example.com',
      },
    }, fields)

    expect(formState.isTouched.value).toBe(false)

    nameField.onBlur()
    expect(formState.isTouched.value).toBe(true)
  })

  it('should handle empty fields map', () => {
    const data = { name: 'John' }
    const formData = reactive(data)
    const fields = useFieldRegistry({
      formData,
      initialData: data,
    })

    const formState = useFormState({
      formData,
      initialData: { name: 'John' },
    }, fields)

    expect(formState.isDirty.value).toBe(false)
    expect(formState.isTouched.value).toBe(false)
  })

  it('should handle complex nested object changes', () => {
    const initialData = {
      user: {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'New York',
        },
      },
    }
    const formData = reactive(JSON.parse(JSON.stringify(initialData)))
    const fields = useFieldRegistry({
      formData,
      initialData,
    })

    const formState = useFormState({
      formData,
      initialData,
    }, fields)

    expect(formState.isDirty.value).toBe(false)

    formData.user.address.city = 'Boston'
    expect(formState.isDirty.value).toBe(true)
  })

  it('should handle array changes', () => {
    const initialData = { tags: ['vue', 'typescript'] }
    const formData = reactive({ tags: [...initialData.tags] })
    const fields = useFieldRegistry({
      formData,
      initialData,
    })

    const formState = useFormState({
      formData,
      initialData,
    }, fields)

    expect(formState.isDirty.value).toBe(false)

    formData.tags.push('forms')
    expect(formState.isDirty.value).toBe(true)
  })
})
