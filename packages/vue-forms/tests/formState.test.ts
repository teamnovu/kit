import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { useFieldRegistry } from '../src/composables/useFieldRegistry'
import { useFormState } from '../src/composables/useFormState'
import { useForm } from '../src'
import { useValidation } from '../src/composables/useValidation'

describe('useFormState', () => {
  it('should detect dirty state when form data changes', () => {
    const initialData = {
      name: 'John',
      age: 30,
    }

    const form = useForm({ initialData: initialData })
    form.defineField({ path: 'name' })
    form.defineField({ path: 'age' })

    expect(form.isDirty.value).toBe(false)

    form.data.value.name = 'Jane'
    expect(form.isDirty.value).toBe(true)
  })

  it('should not be dirty when data equals initial data', () => {
    const initialData = {
      name: 'John',
      age: 30,
    }
    const form = useForm({ initialData: initialData })
    form.defineField({ path: 'name' })
    form.defineField({ path: 'age' })

    expect(form.isDirty.value).toBe(false)

    form.data.value.name = 'Jane'
    expect(form.isDirty.value).toBe(true)

    form.data.value.name = 'John' // Back to initial
    expect(form.isDirty.value).toBe(false)
  })

  it('should detect touched state when any field is touched', () => {
    const initialData = {
      name: 'John',
      email: 'john@example.com',
    }
    const data = reactive(initialData)
    const state = reactive({
      data,
      initialData,
    })
    const validationState = useValidation(state, {})
    const fields = useFieldRegistry(state, validationState)

    const nameField = fields.defineField({ path: 'name' })
    fields.defineField({ path: 'email' })

    const formState = useFormState(fields)

    expect(formState.isTouched.value).toBe(false)

    nameField.onBlur()
    expect(formState.isTouched.value).toBe(true)
  })

  it('should handle empty fields map', () => {
    const initialData = {
      name: 'John',
    }
    const data = reactive(initialData)
    const state = reactive({
      data,
      initialData,
    })
    const validationState = useValidation(state, {})
    const fields = useFieldRegistry(state, validationState)

    const formState = useFormState(fields)

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

    const form = useForm({ initialData: initialData })
    form.defineField({ path: 'user' })

    expect(form.isDirty.value).toBe(false)

    form.data.value.user.address.city = 'Boston'
    expect(form.isDirty.value).toBe(true)
  })

  it('should handle array changes', () => {
    const initialData = { tags: ['vue', 'typescript'] }

    const form = useForm({ initialData: initialData })
    form.defineField({ path: 'tags' })

    expect(form.isDirty.value).toBe(false)

    form.data.value.tags.push('forms')
    expect(form.isDirty.value).toBe(true)
  })
})
