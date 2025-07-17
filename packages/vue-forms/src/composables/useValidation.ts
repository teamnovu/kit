import { computed, getCurrentScope, isRef, onBeforeUnmount, reactive, ref, toRefs, unref, watch, type MaybeRef, type Ref } from 'vue'
import z from 'zod'
import type { FormDataDefault } from '../types/form'
import type { ErrorBag, ValidationFunction, ValidationResult, Validator } from '../types/validation'
import { hasErrors, mergeErrors } from '../utils/validation'
import { flattenError } from '../utils/zod'

export interface ValidatorOptions<T> {
  schema?: MaybeRef<z.ZodType>
  validateFn?: MaybeRef<ValidationFunction<T>>
}

export interface ValidationOptions<T> extends ValidatorOptions<T> {
  errors?: MaybeRef<ErrorBag>
}

export const SuccessValidationResult: ValidationResult = {
  isValid: true,
  errors: {
    general: [],
    propertyErrors: {},
  },
}

class ZodSchemaValidator<T extends FormDataDefault> implements Validator<T> {
  constructor(private schema?: z.ZodType<T>) {}

  async validate(data: T): Promise<ValidationResult> {
    if (!this.schema) {
      return SuccessValidationResult
    }

    const result = await this.schema.safeParseAsync(data)

    if (result.success) {
      return SuccessValidationResult
    }

    const zodErrors = flattenError(result.error)

    return {
      isValid: false,
      errors: {
        general: zodErrors.general ?? [],
        propertyErrors: zodErrors.propertyErrors ?? {},
      },
    }
  }
}

class FunctionValidator<T extends FormDataDefault> implements Validator<T> {
  constructor(private validateFn?: ValidationFunction<T>) {}

  async validate(data: T): Promise<ValidationResult> {
    if (!this.validateFn) {
      return SuccessValidationResult
    }

    try {
      const result = await this.validateFn(data)

      if (result.isValid) {
        return SuccessValidationResult
      }

      return result
    } catch (error) {
      return {
        isValid: false,
        errors: {
          general: [(error as Error).message || 'Validation error'],
          propertyErrors: {},
        },
      }
    }
  }
}

class CombinedValidator<T extends FormDataDefault> implements Validator<T> {
  private schemaValidator: ZodSchemaValidator<T>
  private functionValidator: FunctionValidator<T>

  constructor(
    private schema: z.ZodType<T>,
    private validateFn: ValidationFunction<T>,
  ) {
    this.schemaValidator = new ZodSchemaValidator(this.schema)
    this.functionValidator = new FunctionValidator(this.validateFn)
  }

  async validate(data: T): Promise<ValidationResult> {
    const [schemaResult, functionResult] = await Promise.all([
      this.schemaValidator.validate(data),
      this.functionValidator.validate(data),
    ])

    const isValid = schemaResult.isValid && functionResult.isValid

    return {
      isValid,
      errors: mergeErrors(schemaResult.errors, functionResult.errors),
    }
  }
}

export function createValidator<T extends FormDataDefault>(
  options: ValidatorOptions<T>,
): Ref<Validator<T> | undefined> {
  return computed(() => new CombinedValidator(
    unref(options.schema) as z.ZodType<T>,
    unref(options.validateFn) as ValidationFunction<T>,
  ))
}

export function useValidation<T extends FormDataDefault>(
  formState: { formData: T },
  options: ValidationOptions<T>,
) {
  const validationState = reactive({
    validators: ref<Ref<Validator<T> | undefined>[]>([createValidator(options)]),
    isValidated: false,
    errors: unref(options.errors) ?? {
      general: [],
      propertyErrors: {},
    },
  })

  // Watch for changes in the error bag and update validation state
  watch(() => unref(options.errors), async () => {
    const validationResults = await getValidationResults()

    updateErrors(validationResults.errors)
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
  watch(() => formState.formData, () => {
    if (validationState.isValidated) {
      validateForm()
    }
  })

  const defineValidator = (options: ValidatorOptions<T> | Ref<Validator<T>>) => {
    const validator = isRef(options) ? options : createValidator(options)

    validationState.validators.push(validator)

    if (getCurrentScope()) {
      onBeforeUnmount(() => {
        validationState.validators = validationState.validators.filter(
          v => v !== validator,
        )
      })
    }

    return validator
  }

  async function getValidationResults() {
    const validationResults = await Promise.all(
      validationState.validators
        .filter(validator => unref(validator) !== undefined)
        .map(validator => unref(validator)!.validate(formState.formData)),
    )

    const isValid = validationResults.every(result => result.isValid)

    let { errors } = SuccessValidationResult

    if (!isValid) {
      const validationErrors = validationResults.map(result => result.errors)

      errors = mergeErrors(...validationErrors)
    }

    return {
      errors,
      isValid,
    }
  }

  const updateErrors = (newErrors: ErrorBag) => {
    validationState.errors = mergeErrors(unref(options.errors) ?? SuccessValidationResult.errors, newErrors)
  }

  const validateForm = async (): Promise<ValidationResult> => {
    const validationResults = await getValidationResults()

    updateErrors(validationResults.errors)

    validationState.isValidated = true

    return {
      isValid: !hasErrors(validationResults.errors),
      errors: validationState.errors,
    }
  }

  const isValid = computed(() => !hasErrors(validationState.errors))

  return {
    ...toRefs(validationState),
    validateForm,
    defineValidator,
    isValid,
  }
}

export type ValidationState<T extends FormDataDefault> = ReturnType<typeof useValidation<T>>
