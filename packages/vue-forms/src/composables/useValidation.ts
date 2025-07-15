import { reactive, toRefs, unref, watch, type MaybeRef } from 'vue'
import z from 'zod'
import type { FormDataDefault } from '../types/form'
import type { ErrorBag, ValidationFunction, ValidationResult, Validator } from '../types/validation'
import { hasErrors, mergeErrors } from '../utils/validation'

export interface ValidationOptions<T> {
  schema?: MaybeRef<z.ZodType<T>>
  validateFn?: MaybeRef<ValidationFunction<T>>
  errors?: MaybeRef<ErrorBag>
}

const SuccessValidationResult: ValidationResult = {
  isValid: true,
  errors: {
    general: [],
    propertyErrors: {},
  },
}

class ZodSchemaValidator<T extends FormDataDefault> implements Validator<T> {
  constructor(private schema: z.ZodType<T>) {}

  async validate(data: T): Promise<ValidationResult> {
    const result = await this.schema.safeParseAsync(data)

    if (result.success) {
      return SuccessValidationResult
    }

    const zodErrors = z.flattenError(result.error)

    return {
      isValid: false,
      errors: {
        general: zodErrors.formErrors ?? [],
        propertyErrors: zodErrors.fieldErrors ?? {},
      },
    }
  }
}

class FunctionValidator<T extends FormDataDefault> implements Validator<T> {
  constructor(private validateFn: ValidationFunction<T>) {}

  async validate(data: T): Promise<ValidationResult> {
    const result = await this.validateFn(data)

    if (result.isValid) {
      return SuccessValidationResult
    }

    return result
  }
}

export function useValidation<T extends FormDataDefault>(
  formState: { formData: T },
  options: ValidationOptions<T>,
) {
  const validationState = reactive({
    isValidated: false,
    errors: options.errors ?? {
      general: [],
      propertyErrors: {},
    },
  })

  // Watch for changes in the error bag and update validation state
  watch(() => unref(options.errors), async (newErrs) => {
    const newErrors = newErrs ?? SuccessValidationResult.errors

    const validationResults = await getValidationResults()

    validationState.errors = mergeErrors(validationResults.errors, newErrors)
  }, { immediate: true })

  // Watch for changes in validation function or schema
  // to trigger validation. Only run if validation is already validated.
  watch([
    () => unref(options.validateFn),
    () => unref(options.schema),
  ], async (newValidateFn, newSchema) => {
    if (validationState.isValidated) {
      return
    }

    if (newValidateFn || newSchema) {
      const validationResults = await getValidationResults()
      validationState.errors = validationResults.errors
    } else {
      validationState.errors = SuccessValidationResult.errors
    }
  }, { immediate: true })

  // Watch for changes in form data to trigger validation
  watch(() => formState.formData, () => {
    if (validationState.isValidated) {
      validateForm()
    }
  })

  async function getValidationResults() {
    const validateFn = unref(options.validateFn)
    const schema = unref(options.schema)
    const validators: Validator<T>[] = []

    if (validateFn) {
      validators.push(new FunctionValidator(validateFn))
    }

    if (schema) {
      validators.push(new ZodSchemaValidator(schema))
    }

    const validationResults = await Promise.all(
      validators.map(
        validator => validator.validate(formState.formData),
      ),
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

  async function validateForm(): Promise<ValidationResult> {
    const validationResults = await getValidationResults()

    validationState.errors = validationResults.errors
    validationState.isValidated = true

    return {
      isValid: !hasErrors(validationResults.errors),
      errors: validationState.errors,
    }
  }

  return {
    ...toRefs(validationState),
    validateForm,
  }
}

export type ValidationState<T extends FormDataDefault> = ReturnType<typeof useValidation<T>>
