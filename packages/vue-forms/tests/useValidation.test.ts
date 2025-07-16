import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { z } from 'zod'
import { SuccessValidationResult, useValidation } from '../src/composables/useValidation'
import { ErrorBag } from '../src/types/validation'
import { hasErrors } from '../src/utils/validation'

describe('useValidation', () => {
  it('should initialize with no errors', () => {
    const formState = { formData: { name: 'John' } }
    const validation = useValidation(formState, {})

    expect(validation.isValidated.value).toBe(false)
    expect(validation.errors.value.general).toEqual([])
    expect(validation.errors.value.propertyErrors).toEqual({})
  })

  it('should validate with Zod schema successfully', async () => {
    const schema = z.object({
      name: z.string().min(2),
      age: z.number().min(18),
    })

    const formState = {
      formData: {
        name: 'John',
        age: 30,
      },
    }
    const validation = useValidation(formState, { schema })

    const result = await validation.validateForm()

    expect(result.isValid).toBe(true)
    expect(validation.isValidated.value).toBe(true)
    expect(result.errors.general).toEqual([])
    expect(result.errors.propertyErrors).toEqual({})
  })

  it('should validate with Zod schema and return errors', async () => {
    const schema = z.object({
      name: z.string().min(2),
      age: z.number().min(18),
    })

    const formState = {
      formData: {
        name: 'A',
        age: 16,
      },
    }
    const validation = useValidation(formState, { schema })

    const result = await validation.validateForm()

    expect(result.isValid).toBe(false)
    expect(validation.isValidated.value).toBe(true)
    expect(result.errors.propertyErrors.name).toBeDefined()
    expect(result.errors.propertyErrors.age).toBeDefined()
  })

  it('should validate with custom validation function', async () => {
    const validateFn = async (data: { name: string }) => {
      const errors: ErrorBag = {
        general: [],
        propertyErrors: {} as Record<string, string[]>,
      }

      if (data.name.length < 2) {
        errors.propertyErrors.name = ['Name too short']
      }

      if (data.name === 'admin') {
        errors.general = ['Admin name not allowed']
      }

      return {
        isValid: !hasErrors(errors),
        errors,
      }
    }

    const formState = { formData: { name: 'A' } }
    const validation = useValidation(formState, { validateFn })

    const result = await validation.validateForm()

    expect(result.isValid).toBe(false)
    expect(result.errors.propertyErrors.name).toEqual(['Name too short'])
  })

  it('should validate with both schema and function', async () => {
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

    const formState = { formData: { name: 'forbidden' } }
    const validation = useValidation(formState, {
      schema,
      validateFn,
    })

    const result = await validation.validateForm()

    expect(result.isValid).toBe(false)
    expect(result.errors.general).toEqual(['Forbidden name'])
  })

  it('should handle reactive schema changes', async () => {
    const schema = ref(z.object({
      name: z.string().min(2),
    }))

    const formState = {
      formData: {
        name: 'A',
        age: 25,
      },
    }
    const validation = useValidation(formState, { schema })

    // Initial validation
    let result = await validation.validateForm()
    expect(result.isValid).toBe(false)

    // Change schema to be more permissive
    schema.value = z.object({
      name: z.string().min(1),
    })

    await nextTick()
    result = await validation.validateForm()
    expect(result.isValid).toBe(true)
  })

  it('should handle reactive validation function changes', async () => {
    const strictValidation = async (data: { name: string }) => ({
      isValid: data.name.length >= 5,
      errors: {
        general: [],
        propertyErrors: data.name.length < 5 ? { name: ['Too short'] } : {},
      },
    })

    const lenientValidation = async () => ({
      isValid: true,
      errors: {
        general: [],
        propertyErrors: {},
      },
    })

    const validateFn = ref(strictValidation)
    const formState = { formData: { name: 'John' } }
    const validation = useValidation(formState, { validateFn })

    // Initial validation with strict rules
    let result = await validation.validateForm()
    expect(result.isValid).toBe(false)

    // Change to lenient validation
    validateFn.value = lenientValidation
    await nextTick()
    result = await validation.validateForm()
    expect(result.isValid).toBe(true)
  })

  it('should handle external error injection', async () => {
    const errors = ref({
      general: ['External error'],
      propertyErrors: { name: ['External field error'] },
    })

    const formState = { formData: { name: 'John' } }
    const validation = useValidation(formState, { errors })

    await nextTick()

    expect(validation.errors.value.general).toEqual(['External error'])
    expect(validation.errors.value.propertyErrors.name).toEqual(['External field error'])
  })

  it('should merge validation errors with external errors', async () => {
    const schema = z.object({
      name: z.string().min(2),
    })

    const errors = ref<ErrorBag>(SuccessValidationResult.errors)

    const formState = { formData: { name: 'A' } }
    const validation = useValidation(formState, {
      schema,
      errors,
    })

    errors.value = {
      general: ['External error'],
      propertyErrors: { email: ['External email error'] },
    }

    const result = await validation.validateForm()

    expect(result.isValid).toBe(false)
    expect(result.errors.general).toEqual(['External error'])
    expect(result.errors.propertyErrors.name).toEqual(['Too small: expected string to have >=2 characters']) // From schema validation
    expect(result.errors.propertyErrors.email).toEqual(['External email error'])
  })
})
