import { computed, getCurrentScope, isRef, onBeforeUnmount, reactive, ref, toRefs, unref, watch, type MaybeRef, type Ref } from 'vue'
import z from 'zod'
import type { FormDataDefault } from '../types/form'
import type { ErrorBag, ValidationFunction, ValidationResult, Validator } from '../types/validation'
import { hasErrors, isValidResult, mergeErrors } from '../utils/validation'
import { flattenError } from '../utils/zod'

export interface ValidatorOptions<T, TOut = T> {
  schema?: MaybeRef<z.ZodType<TOut, unknown> | undefined>
  validateFn?: MaybeRef<ValidationFunction<T, TOut> | undefined>
}

export interface ValidationOptions<T, TOut = T> extends ValidatorOptions<T, TOut> {
  errors?: MaybeRef<ErrorBag | undefined>
}

export const SuccessValidationResult: ValidationResult<never> = {
  errors: {
    general: [],
    propertyErrors: {},
  },
}

class ZodSchemaValidator<T extends FormDataDefault, TOut = T> implements Validator<T, TOut> {
  constructor(private schema?: z.ZodType<TOut, T>) {}

  async validate(data: T): Promise<ValidationResult<TOut>> {
    if (!this.schema) {
      return SuccessValidationResult
    }

    const result = await this.schema.safeParseAsync(data)

    if (result.success) {
      return SuccessValidationResult
    }

    const zodErrors = flattenError(result.error)

    return {
      data: result.data,
      errors: {
        general: zodErrors.general ?? [],
        propertyErrors: zodErrors.propertyErrors ?? {},
      },
    }
  }
}

class FunctionValidator<T extends FormDataDefault, TOut = T> implements Validator<T, TOut> {
  constructor(private validateFn?: ValidationFunction<T, TOut>) {}

  async validate(data: T): Promise<ValidationResult<TOut>> {
    if (!this.validateFn) {
      return SuccessValidationResult
    }

    try {
      const result = await this.validateFn(data)

      if (isValidResult(result)) {
        return SuccessValidationResult
      }

      return result
    } catch (error) {
      return {
        errors: {
          general: [(error as Error).message || 'Validation error'],
          propertyErrors: {},
        },
      }
    }
  }
}

class CombinedValidator<T extends FormDataDefault, TOut = T> implements Validator<T, TOut> {
  private schemaValidator: ZodSchemaValidator<T, TOut>
  private functionValidator: FunctionValidator<T, TOut>

  constructor(
    private schema: z.ZodType<TOut, T>,
    private validateFn: ValidationFunction<T, TOut>,
  ) {
    this.schemaValidator = new ZodSchemaValidator(this.schema)
    this.functionValidator = new FunctionValidator(this.validateFn)
  }

  async validate(data: T): Promise<ValidationResult<TOut>> {
    const [schemaResult, functionResult] = await Promise.all([
      this.schemaValidator.validate(data),
      this.functionValidator.validate(data),
    ])

    return {
      data: schemaResult.data,
      errors: mergeErrors(schemaResult.errors, functionResult.errors),
    }
  }
}

export function createValidator<T extends FormDataDefault, TOut = T>(
  options: ValidatorOptions<T, TOut>,
): Ref<Validator<T, TOut> | undefined> {
  return computed(() => new CombinedValidator(
    unref(options.schema) as z.ZodType<TOut, T>,
    unref(options.validateFn) as ValidationFunction<T, TOut>,
  ))
}

export function useValidation<T extends FormDataDefault, TOut = T>(
  formState: { data: T },
  options: ValidationOptions<T, TOut>,
) {
  const validationState = reactive({
    validators: ref<Ref<Validator<T, TOut> | undefined>[]>([createValidator(options)]),
    isValidated: false,
    errors: unref(options.errors) ?? SuccessValidationResult.errors,
  })

  const updateErrors = (newErrors: ErrorBag = SuccessValidationResult.errors) => {
    validationState.errors = mergeErrors(unref(options.errors) ?? SuccessValidationResult.errors, newErrors)
  }

  // Watch for changes in the error bag and update validation state
  watch(() => unref(options.errors), async () => {
    if (validationState.isValidated) {
      const validationResults = await getValidationResults()

      updateErrors(validationResults.errors)
    } else {
      updateErrors()
    }
  }, { immediate: true })

  // Watch for changes in validation function or schema
  // to trigger validation. Only run if validation is already validated.
  watch(
    [() => validationState.validators],
    async (validators) => {
      if (!validationState.isValidated) {
        return
      }

      if (validators) {
        const validationResults = await getValidationResults()
        validationState.errors = validationResults.errors
      } else {
        validationState.errors = SuccessValidationResult.errors
      }
    },
    { immediate: true },
  )

  // Watch for changes in form data to trigger validation
  watch([() => formState.data, () => unref(options.schema)], () => {
    if (validationState.isValidated) {
      validateForm()
    }
  })

  const defineValidator = <TData extends T, TDataOut extends TOut>(
    options: ValidatorOptions<TData, TDataOut> | Ref<Validator<TData, TDataOut>>
  ) => {
    const validator = isRef(options) ? options : createValidator(options)

    validationState.validators.push(validator as Ref<Validator<T, TOut> | undefined>)

    if (getCurrentScope()) {
      onBeforeUnmount(() => {
        validationState.validators = validationState.validators.filter(
          v => v !== validator,
        )
      })
    }

    return validator
  }

  async function getValidationResults(): Promise<ValidationResult<TOut>> {
    const validationResults = await Promise.all(
      validationState.validators
        .filter(validator => unref(validator) !== undefined)
        .map(validator => unref(validator)!.validate(formState.data)),
    )

    const valid = validationResults.every(result => isValidResult(result))

    let { errors } = SuccessValidationResult

    if (!valid) {
      const validationErrors = validationResults.map(result => result.errors)

      errors = mergeErrors(...validationErrors)
    }

    return {
      errors,
      // TODO: Implement data disambiguation strategy
      data: validationResults.findLast(result => !!result.data)?.data,
    }
  }

  const validateForm = async (): Promise<ValidationResult<TOut>> => {
    const validationResults = await getValidationResults()

    updateErrors(validationResults.errors)

    validationState.isValidated = true

    return {
      errors: validationState.errors,
    }
  }

  const validateField = async (path: string): Promise<ValidationResult<TOut>> => {
    const validationResults = await getValidationResults()

    updateErrors({
      general: validationResults.errors.general,
      propertyErrors: {
        [path]: validationResults.errors.propertyErrors[path],
      },
    })

    return {
      data: validationResults.data,
      errors: validationState.errors,
    }
  }

  const isValid = computed(() => !hasErrors(validationState.errors))

  const reset = () => {
    validationState.isValidated = false
    validationState.errors = unref(options.errors) ?? SuccessValidationResult.errors
  }

  return {
    ...toRefs(validationState),
    validateForm,
    validateField,
    defineValidator,
    isValid,
    reset,
  }
}

export type ValidationState<T extends FormDataDefault, TOut = T> = ReturnType<typeof useValidation<T, TOut>>
