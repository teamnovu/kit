import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { z } from 'zod'
import { useForm } from '../src/composables/useForm'
import { SuccessValidationResult, useValidation } from '../src/composables/useValidation'
import { ErrorBag } from '../src/types/validation'
import { hasErrors, isValidResult } from '../src/utils/validation'

const delay = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms))

describe('useValidation', () => {
  it('should initialize with no errors', () => {
    const formState = { data: { name: 'John' } }
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
      data: {
        name: 'John',
        age: 30,
      },
    }
    const validation = useValidation(formState, { schema })

    const result = await validation.validateForm()

    expect(isValidResult(result)).toBe(true)
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
      data: {
        name: 'A',
        age: 16,
      },
    }
    const validation = useValidation(formState, { schema })

    const result = await validation.validateForm()

    expect(isValidResult(result)).toBe(false)
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

    const formState = { data: { name: 'A' } }
    const validation = useValidation(formState, { validateFn })

    const result = await validation.validateForm()

    expect(isValidResult(result)).toBe(false)
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

    const formState = { data: { name: 'forbidden' } }
    const validation = useValidation(formState, {
      schema,
      validateFn,
    })

    const result = await validation.validateForm()

    expect(isValidResult(result)).toBe(false)
    expect(result.errors.general).toEqual(['Forbidden name'])
  })

  it('should handle reactive schema changes', async () => {
    const schema = ref(z.object({
      name: z.string().min(2),
    }))

    const formState = {
      data: {
        name: 'A',
        age: 25,
      },
    }
    const validation = useValidation(formState, { schema })

    // Initial validation
    let result = await validation.validateForm()
    expect(isValidResult(result)).toBe(false)

    // Change schema to be more permissive
    schema.value = z.object({
      name: z.string().min(1),
    })

    await nextTick()
    result = await validation.validateForm()
    expect(isValidResult(result)).toBe(true)
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
    const formState = { data: { name: 'John' } }
    const validation = useValidation(formState, { validateFn })

    // Initial validation with strict rules
    let result = await validation.validateForm()
    expect(isValidResult(result)).toBe(false)

    // Change to lenient validation
    validateFn.value = lenientValidation
    await nextTick()
    result = await validation.validateForm()
    expect(isValidResult(result)).toBe(true)
  })

  it('should handle external error injection', async () => {
    const errors = ref({
      general: ['External error'],
      propertyErrors: { name: ['External field error'] },
    })

    const formState = { data: { name: 'John' } }
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

    const formState = { data: { name: 'A' } }
    const validation = useValidation(formState, {
      schema,
      errors,
    })

    errors.value = {
      general: ['External error'],
      propertyErrors: { email: ['External email error'] },
    }

    const result = await validation.validateForm()

    expect(isValidResult(result)).toBe(false)
    expect(result.errors.general).toEqual(['External error'])
    expect(result.errors.propertyErrors.name).toEqual(['Too small: expected string to have >=2 characters']) // From schema validation
    expect(result.errors.propertyErrors.email).toEqual(['External email error'])
  })

  it('should pass errors to the field', async () => {
    const errors = ref<ErrorBag>(SuccessValidationResult.errors)

    const form = useForm({
      initialData: { name: 'A' },
      errors,
    })

    const field = form.getField('name')

    expect(field.errors.value).toEqual([]) // Initially no errors

    errors.value = {
      general: [],
      propertyErrors: { name: ['Name error'] },
    }

    await delay()

    expect(field.errors.value).toEqual(['Name error'])
  })

  it('should initialize properly when using a zod schema', async () => {
    const schema = z.object({
      name: z.string().min(2),
    })

    const formState = { data: { name: 'A' } }
    const validation = useValidation(formState, {
      schema,
    })

    expect(validation.errors.value).toEqual(SuccessValidationResult.errors)
    expect(validation.isValid.value).toEqual(true)

    const result = await validation.validateForm()

    expect(isValidResult(result)).toBe(false)
    expect(result.errors.propertyErrors.name).toEqual(['Too small: expected string to have >=2 characters']) // From schema validation
  })

  it('should reset the form errors', async () => {
    const schema = z.object({
      name: z.string().min(2),
    })

    const formState = { data: { name: 'A' } }
    const validation = useValidation(formState, {
      schema,
    })

    await validation.validateForm()

    expect(validation.isValidated.value).toBe(true)
    expect(validation.isValid.value).toBe(false)
    expect(validation.errors.value.propertyErrors.name).toEqual(['Too small: expected string to have >=2 characters']) // From schema validation

    validation.reset()

    expect(validation.isValidated.value).toBe(false)
    expect(validation.errors.value).toEqual(SuccessValidationResult.errors)
  })

  it('should not the form on blur if configured but the form was never validated yet', async () => {
    const schema = z.object({
      name: z.string().min(2),
    })

    const initialData = { name: 'A' }
    const form = useForm({
      initialData,
      schema,
      validationStrategy: 'onTouch',
    })

    const nameField = form.getField('name')

    // Simulate blur event
    nameField.onBlur()

    // onBlur is not async but the validation runs async
    await delay()

    expect(form.isValid.value).toBe(true)
    expect(form.errors.value.propertyErrors.name).toHaveLength(0)
  })

  it('should validate the form on blur if configured', async () => {
    const schema = z.object({
      name: z.string().min(2),
    })

    const initialData = { name: 'A' }
    const form = useForm({
      initialData,
      schema,
      validationStrategy: 'onTouch',
    })

    const nameField = form.getField('name')

    await form.validateForm()

    // Simulate blur event
    nameField.onBlur()

    // onBlur is not async but the validation runs async
    await delay()

    expect(form.isValid.value).toBe(false)
    expect(form.errors.value.propertyErrors.name).toHaveLength(1)
  })

  it('should not validate other fields than the blurred one', async () => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.email(),
    })

    const initialData = {
      name: 'A',
      email: 'invalid-email',
    }

    const form = useForm({
      initialData,
      schema,
      validationStrategy: 'onTouch',
    })

    const nameField = form.getField('name')
    form.getField('email')

    await form.validateForm()

    nameField.data.value = 'ab'

    await delay()

    // Data changed, but validation not triggered yet
    expect(form.isValid.value).toBe(false)
    expect(form.errors.value.propertyErrors.name).toHaveLength(1)
    expect(form.errors.value.propertyErrors.email ?? []).toHaveLength(1)

    // Simulate blur event
    nameField.onBlur()

    // onBlur is not async but the validation runs async
    await delay()

    expect(form.isValid.value).toBe(false)
    expect(form.errors.value.propertyErrors.name).toHaveLength(0)
    expect(form.errors.value.propertyErrors.email ?? []).toHaveLength(1)
  })

  it('should validate the form on form open if configured', async () => {
    const schema = z.object({
      name: z.string().min(2),
    })

    const initialData = { name: 'A' }
    const form = useForm({
      initialData,
      schema,
      validationStrategy: 'onFormOpen',
    })

    form.getField('name')

    await delay()

    expect(form.isValidated.value).toBe(true)
    expect(form.isValid.value).toBe(false)
    expect(form.errors.value.propertyErrors.name).toHaveLength(1)
  })

  it('should not the form on submit if validation strategy is "none"', async () => {
    const schema = z.object({
      name: z.string().min(2),
    })

    const initialData = { name: 'A' }
    const form = useForm({
      initialData,
      schema,
      validationStrategy: 'none',
    })

    form.getField('name')

    const cb = vi.fn()

    const submitHandler = form.submitHandler(cb)

    await submitHandler(new SubmitEvent('submit'))

    expect(form.isValidated.value).toBe(false)
    expect(form.isValid.value).toBe(true)
  })

  it('should validate the form on data change if configured', async () => {
    const schema = z.object({
      name: z.string().min(2),
    })

    const initialData = { name: 'ABC' }
    const form = useForm({
      initialData,
      schema,
      validationStrategy: 'onDataChange',
    })

    const nameField = form.getField('name')

    await form.validateForm()

    expect(form.isValid.value).toBe(true)

    nameField.data.value = 'a'

    await delay()

    expect(form.isValid.value).toBe(false)
    expect(form.errors.value.propertyErrors.name).toHaveLength(1)
  })

  it('should not validate other fields on data change', async () => {
    const schema = z.object({
      name: z.string().min(2),
      foo: z.string().min(2),
    })

    const initialData = {
      name: 'b',
      foo: 'c',
    }
    const form = useForm({
      initialData,
      schema,
      validationStrategy: 'onDataChange',
    })

    const nameField = form.getField('name')

    await form.validateForm()

    expect(form.isValid.value).toBe(false)
    expect(form.errors.value.propertyErrors.name).toHaveLength(1)
    expect(form.errors.value.propertyErrors.foo).toHaveLength(1)

    nameField.data.value = 'abc'

    await delay()

    expect(form.isValid.value).toBe(false)
    expect(form.errors.value.propertyErrors.name).toHaveLength(0)
    expect(form.errors.value.propertyErrors.foo).toHaveLength(1)
  })
})
