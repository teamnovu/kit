import { describe, expect, it } from 'vitest'
import { effectScope, isReactive, nextTick, reactive, ref } from 'vue'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'

const scope = effectScope()

describe('useForm', () => {
  beforeAll(() => {

  })
  it('should initialize form with initial data', () => {
    const initialData = {
      name: 'John',
      age: 30,
    }
    const form = useForm({ initialData })

    expect(form.data.value).toEqual(initialData)
    expect(form.initialData.value).toEqual(initialData)
  })

  it('should initialize form with reactive initial data', async () => {
    const initialData = ref({
      name: 'John',
      age: 30,
    })
    const form = useForm({ initialData })

    expect(form.data.value).toEqual({
      name: 'John',
      age: 30,
    })

    // Update reactive initial data
    initialData.value = {
      name: 'Jane',
      age: 25,
    }
    await nextTick()

    expect(form.initialData.value).toEqual({
      name: 'Jane',
      age: 25,
    })
  })

  it('should reinitialize form with new initial data', async () => {
    const initialData = ref({
      name: 'John',
      age: 30,
    })
    const form = useForm({ initialData })

    expect(form.data.value).toEqual({
      name: 'John',
      age: 30,
    })

    // Update reactive initial data
    initialData.value = {
      name: 'Jane',
      age: 25,
    }
    await nextTick()

    expect(form.data.value).toEqual({
      name: 'Jane',
      age: 25,
    })
  })

  it('should have initial state values', () => {
    const form = useForm({ initialData: { name: 'John' } })

    expect(form.isDirty.value).toBe(false)
    expect(form.isTouched.value).toBe(false)
    expect(form.isValid.value).toBe(true)
    expect(form.isValidated.value).toBe(false)
  })

  it('should define fields and auto-register them', () => {
    const form = useForm({
      initialData: {
        name: 'John',
        email: 'john@example.com',
      },
    })

    const nameField = form.defineField({ path: 'name' })
    const emailField = form.defineField({ path: 'email' })

    expect(nameField.path.value).toBe('name')
    expect(emailField.path.value).toBe('email')
    expect(form.fields.value.length).toBe(2)
  })

  it('should get registered fields', () => {
    const form = useForm({
      initialData: {
        name: 'John',
        email: 'john@example.com',
      },
    })

    const nameField = form.defineField({ path: 'name' })
    form.defineField({ path: 'email' })

    const retrievedField = form.getField('name')
    expect(retrievedField?.path.value).toBe('name')
    expect(retrievedField).toBe(nameField)
  })

  it('should handle nested object initial data', () => {
    const initialData = {
      user: {
        name: 'John',
        address: {
          street: '123 Main St',
          city: 'New York',
        },
      },
    }
    const form = useForm({ initialData })

    expect(form.data.value).toEqual(initialData)
    expect(form.initialData.value).toEqual(initialData)
  })

  it('should validate with schema', async () => {
    const schema = z.object({
      name: z.string().min(2),
      age: z.number().min(18),
    })

    const form = useForm({
      initialData: {
        name: 'A',
        age: 16,
      },
      schema,
    })

    const result = await form.validateForm()

    expect(result.isValid).toBe(false)
    expect(form.isValidated.value).toBe(true)
    expect(form.errors.value.propertyErrors.name).toBeDefined()
    expect(form.errors.value.propertyErrors.age).toBeDefined()
  })

  it('should validate with custom function', async () => {
    const validateFn = async (data: { name: string }) => {
      const errors = {
        general: [],
        propertyErrors: {} as Record<string, string[]>,
      }

      if (data.name.length < 2) {
        errors.propertyErrors.name = ['Name too short']
      }

      return {
        isValid: Object.keys(errors.propertyErrors).length === 0,
        errors,
      }
    }

    const form = useForm({
      initialData: { name: 'A' },
      validateFn,
    })

    const result = await form.validateForm()

    expect(result.isValid).toBe(false)
    expect(result.errors.propertyErrors.name).toEqual(['Name too short'])
  })

  it('should pass validation with valid data', async () => {
    const schema = z.object({
      name: z.string().min(2),
      age: z.number().min(18),
    })

    const form = useForm({
      initialData: {
        name: 'John',
        age: 30,
      },
      schema,
    })

    const result = await form.validateForm()

    expect(result.isValid).toBe(true)
    expect(form.isValidated.value).toBe(true)
    expect(form.errors.value.general).toEqual([])
    expect(form.errors.value.propertyErrors).toEqual({})
  })

  it('can handle arrays on top level', async () => {
    const schema = z.array(z.string())

    const form = useForm({
      initialData: ['item1', 'item2'],
      schema,
    })

    const result = await form.validateForm()

    expect(result.isValid).toBe(true)
    expect(form.isValidated.value).toBe(true)
    expect(form.errors.value.general).toEqual([])
    expect(form.errors.value.propertyErrors).toEqual({})

    const rootField = form.defineField({ path: '' })
    const itemField = form.defineField({ path: '1' })

    expect(rootField.data.value).toEqual(['item1', 'item2'])
    expect(itemField.data.value).toBe('item2')
  })

  it('can handle late initialized fields', async () => {
    const form = useForm({
      initialData: {
        name: 'John',
        age: 30,
      },
    })

    // No fields defined yet
    expect(form.fields.value).toEqual([])
    expect(form.isDirty.value).toBe(false)

    const nameField = form.defineField({ path: 'name' })

    expect(form.fields.value.length).toBe(1)
    expect(form.isDirty.value).toBe(false)

    nameField.setData('Bob')

    expect(form.isDirty.value).toBe(true)
  })

  it('fields can be made reactive', async () => {
    const form = useForm({
      initialData: {
        name: 'John',
        age: 30,
      },
    })

    const nameField = form.defineField({ path: 'name' })

    expect(isReactive(reactive(nameField))).toBe(true)
  })

  it('fields should only be removed when all references are gone', async () => {
    const form = useForm({
      initialData: {
        name: 'John',
        age: 30,
      },
    })

    expect(form.fields.value).toEqual([])

    const scope1 = effectScope()

    scope1.run(() => {
      form.defineField({ path: 'name' })
    })

    expect(form.fields.value.length).toBe(1)

    const scope2 = effectScope()

    scope2.run(() => {
      form.defineField({ path: 'name' })
    })

    expect(form.fields.value.length).toBe(1)

    scope1.stop()

    expect(form.fields.value.length).toBe(1)

    scope2.stop()

    expect(form.fields.value.length).toBe(0)
  })

  it('it should take over the new initial data from the form', { timeout: 500 }, async () => {
    const initialData = ref({
      name: 'foo',
    })

    const form = useForm({
      initialData,
    })

    const nameField = form.getField('name')

    expect(form.isDirty.value).toBe(false)
    expect(nameField.dirty.value).toBe(false)

    nameField.setData('modified')

    expect(form.isDirty.value).toBe(true)
    expect(nameField.dirty.value).toBe(true)

    initialData.value = {
      name: 'bar',
    }

    expect(form.initialData.value.name).toBe('bar')
    expect(nameField.initialValue.value).toBe('bar')
    expect(nameField.data.value).toBe('bar')

    nameField.setInitialData('another')

    expect(nameField.initialValue.value).toBe('another')
    expect(nameField.data.value).toBe('another')
  })

  it('it should take over the new initial data from the form after setting initial data on field', { timeout: 500 }, async () => {
    const initialData = ref({
      name: null as null | number,
    })

    const form = useForm({
      initialData,
    })

    const nameField = form.getField('name')

    expect(form.isDirty.value).toBe(false)
    expect(nameField.dirty.value).toBe(false)

    nameField.setInitialData(0)

    expect(form.isDirty.value).toBe(false)
    expect(nameField.dirty.value).toBe(false)

    initialData.value = {
      name: null,
    }

    expect(form.initialData.value.name).toBe(null)
    expect(nameField.initialValue.value).toBe(null)
    expect(nameField.data.value).toBe(null)

    nameField.setInitialData(23)

    expect(nameField.initialValue.value).toBe(23)
    expect(nameField.data.value).toBe(23)
  })
})
