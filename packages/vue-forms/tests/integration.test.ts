import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'

describe('Integration Tests', () => {
  it('should handle complete form workflow', async () => {
    const schema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.email('Invalid email'),
      age: z.number().min(18, 'Must be 18 or older'),
    })

    const form = useForm({
      initialData: {
        name: '',
        email: '',
        age: 0,
      },
      schema,
    })

    // Create fields
    const nameField = form.defineField({ path: 'name' })
    const emailField = form.defineField({ path: 'email' })
    const ageField = form.defineField({ path: 'age' })

    // Initial state
    expect(form.isDirty.value).toBe(false)
    expect(form.isTouched.value).toBe(false)
    expect(form.isValid.value).toBe(true) // No validation run yet
    expect(form.isValidated.value).toBe(false)

    // Fill out form
    nameField.setData('John')
    emailField.setData('john@example.com')
    ageField.setData(25)

    // Form should be dirty now
    expect(form.isDirty.value).toBe(true)

    // Touch fields
    nameField.onBlur()
    emailField.onBlur()

    // Form should be touched
    expect(form.isTouched.value).toBe(true)

    // Validate form
    const result = await form.validateForm()
    expect(result.isValid).toBe(true)
    expect(form.isValidated.value).toBe(true)
  })

  it('should handle form with validation errors', async () => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
    })

    const form = useForm({
      initialData: {
        name: 'A',
        email: 'invalid',
      },
      schema,
    })

    const nameField = form.defineField({ path: 'name' })
    const emailField = form.defineField({ path: 'email' })

    // Validate with invalid data
    const result = await form.validateForm()
    expect(result.isValid).toBe(false)
    expect(result.errors.propertyErrors.name).toBeDefined()
    expect(result.errors.propertyErrors.email).toBeDefined()

    // Fix the data
    nameField.setData('John')
    emailField.setData('john@example.com')

    // Re-validate
    const result2 = await form.validateForm()
    expect(result2.isValid).toBe(true)
  })

  it('should handle reactive initial data changes', async () => {
    const initialData = ref({
      name: 'John',
      age: 30,
    })
    const form = useForm({ initialData })

    const nameField = form.defineField({ path: 'name' })

    expect(nameField.data.value).toEqual('John')
    expect(form.data.value).toEqual({
      name: 'John',
      age: 30,
    })

    // Change initial data
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

  it('should handle nested object validation', async () => {
    const schema = z.object({
      user: z.object({
        name: z.string().min(2),
        contact: z.object({
          email: z.string().email(),
        }),
      }),
    })

    const form = useForm({
      initialData: {
        user: {
          name: 'A',
          contact: {
            email: 'invalid',
          },
        },
      },
      schema,
    })

    const result = await form.validateForm()
    expect(result.isValid).toBe(false)
    expect(result.errors.propertyErrors['user.name']).toBeDefined()
    expect(result.errors.propertyErrors['user.contact.email']).toBeDefined()
  })

  it('should merge multiple validation sources', async () => {
    const schema = z.object({
      name: z.string().min(1),
    })

    const validateFn = async (data: { name: string }) => ({
      isValid: data.name !== 'forbidden',
      errors: {
        general: data.name === 'forbidden' ? ['Forbidden name'] : [],
        propertyErrors: {},
      },
    })

    const externalErrors = ref({
      general: ['External error'],
      propertyErrors: { name: ['External field error'] },
    })

    const form = useForm({
      initialData: { name: 'forbidden' },
      schema,
      validateFn,
      errors: externalErrors,
    })

    const result = await form.validateForm()
    expect(result.isValid).toBe(false)

    // Should have errors from all sources
    expect(result.errors.general).toContain('Forbidden name')
    expect(result.errors.general).toContain('External error')
    expect(result.errors.propertyErrors.name).toContain('External field error')
  })

  it('should handle field registry operations', () => {
    const form = useForm({
      initialData: {
        name: 'John',
        email: 'john@test.com',
      },
    })

    // Define fields
    const nameField = form.defineField({ path: 'name' })
    form.defineField({ path: 'email' })

    // Check registry
    expect(form.getFields().length).toBe(2)

    // Get specific field
    const retrievedNameField = form.getField('name')
    expect(retrievedNameField).toBe(nameField)

    // Try to get non-existent field
    const nonExistentField = form.getField('nonexistent')
    expect(nonExistentField).toBeUndefined()
  })
})
