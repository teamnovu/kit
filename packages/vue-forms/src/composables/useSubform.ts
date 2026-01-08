import { computed, isRef, unref, type Ref } from 'vue'
import type {
  FieldsTuple,
  Form,
  FormDataDefault,
  FormField,
} from '../types/form'
import type { EntityPaths, Paths, PickEntity, PickProps } from '../types/util'
import type { ValidationResult, Validator } from '../types/validation'
import {
  filterErrorsForPath,
  getLens,
  getNestedValue,
  joinPath,
} from '../utils/path'
import { makeSubmitHandler } from '../utils/submitHandler'
import { useFieldArray } from './useFieldArray'
import type { DefineFieldOptions } from './useFieldRegistry'
import type { UseFormOptions } from './useForm'
import {
  createValidator,
  SuccessValidationResult,
  type ValidatorOptions,
} from './useValidation'

export interface SubformOptions<_T extends FormDataDefault> {
  // Additional subform-specific options can be added here
}

class NestedValidator<T extends FormDataDefault, P extends Paths<T>>
implements Validator<T> {
  constructor(
    private path: P,
    private validator: Validator<PickEntity<T, P>> | undefined,
  ) {}

  async validate(data: T): Promise<ValidationResult> {
    const subFormData = getNestedValue(data, this.path) as PickEntity<T, P>

    if (!this.validator) {
      return SuccessValidationResult
    }

    const validationResult = await this.validator.validate(subFormData)

    return {
      isValid: validationResult.isValid,
      errors: {
        general: validationResult.errors.general || [],
        propertyErrors: validationResult.errors.propertyErrors
          ? Object.fromEntries(
              Object.entries(validationResult.errors.propertyErrors).map(
                ([key, errors]) => [joinPath(this.path, key), errors],
              ),
            )
          : {},
      },
    }
  }
}

export function createSubformInterface<
  T extends FormDataDefault,
  K extends EntityPaths<T>,
>(
  mainForm: Form<T>,
  path: K,
  formOptions?: UseFormOptions<T>,
  _options?: SubformOptions<PickEntity<T, K>>,
): Form<PickEntity<T, K>> {
  type ST = PickEntity<T, K>
  type SP = Paths<ST>
  type MP<P extends SP> = `${K}.${P}`
  type ScopedMainPaths = Paths<T> & MP<SP>

  // Create reactive data scoped to subform path
  const data = getLens(mainForm.data, path) as Ref<ST>

  const initialData = computed(() => {
    return getNestedValue(mainForm.initialData.value, path) as ST
  })

  const adaptMainFormField = <S extends SP>(
    field: FormField<PickProps<T, ScopedMainPaths>, ScopedMainPaths>,
  ): FormField<PickProps<ST, S>, S> => {
    // Where P ist the full path in the main form, we need to adapt it to the subform's path
    return {
      ...field,
      path: computed(() => unref(field.path).replace(path + '.', '')),
      setData: (newData: PickProps<ST, S>) => {
        field.setData(newData as PickProps<T, ScopedMainPaths>)
      },
    } as unknown as FormField<PickProps<ST, S>, S>
  }

  const getField = <P extends SP>(fieldPath: P) => {
    const fullPath = joinPath(path, fieldPath)
    const mainFormField = mainForm.getField(fullPath as ScopedMainPaths)

    if (!mainFormField) {
      return {} as FormField<PickProps<ST, P>, P>
    }

    return adaptMainFormField<P>(mainFormField)
  }

  // Field operations with path transformation
  const defineField = <P extends SP>(
    fieldOptions: DefineFieldOptions<ST, P>,
  ) => {
    const fullPath = joinPath(path, fieldOptions.path)

    const mainField = mainForm.defineField({
      ...fieldOptions,
      path: fullPath as ScopedMainPaths,
    })

    return adaptMainFormField<P>(mainField)
  }

  const fields = computed(<P extends SP>() => {
    return (
      mainForm.fields.value as FormField<
        PickProps<T, ScopedMainPaths>,
        ScopedMainPaths
      >[]
    )
      .filter((field) => {
        const fieldPath = field.path.value
        return fieldPath.startsWith(path + '.') || fieldPath === path
      })
      .map(field => adaptMainFormField(field)) as FieldsTuple<ST, P>
  })

  // Helper function to get all fields without type parameter
  const getAllSubformFields = () => {
    return (
      mainForm.fields.value as FormField<
        PickProps<T, ScopedMainPaths>,
        ScopedMainPaths
      >[]
    ).filter((field) => {
      const fieldPath = field.path.value
      return fieldPath.startsWith(path + '.') || fieldPath === path
    })
  }

  // State computed from main form with path filtering
  const isDirty = computed(() =>
    getAllSubformFields().some(field => field.dirty.value))
  const isTouched = computed(() =>
    getAllSubformFields().some(field => field.touched.value))

  // Validation delegates to main form
  const isValid = computed(() => mainForm.isValid.value)
  const isValidated = computed(() => mainForm.isValidated.value)
  const errors = computed(() =>
    filterErrorsForPath(unref(mainForm.errors), path))

  const validateForm = () => mainForm.validateForm()

  // Nested subforms
  const getSubForm = <P extends EntityPaths<ST>>(
    subPath: P,
    subOptions?: SubformOptions<PickEntity<ST, P>>,
  ) => {
    const fullPath = joinPath(path, subPath) as EntityPaths<T>
    return mainForm.getSubForm(
      fullPath,
      subOptions as SubformOptions<PickEntity<T, typeof fullPath>>,
    ) as Form<PickEntity<ST, P>>
  }

  // Reset scoped to this subform
  const reset = () => getAllSubformFields().forEach(field => field.reset())

  const defineValidator = (
    options: ValidatorOptions<ST> | Ref<Validator<ST>>,
  ) => {
    const subValidator = isRef(options) ? options : createValidator(options)
    const validator = computed(
      () => new NestedValidator<T, K>(path, unref(subValidator)),
    )

    mainForm.defineValidator(validator)

    return subValidator
  }

  const subForm: Form<ST> = {
    data: data,
    fields,
    initialData,
    defineField,
    getField,
    isDirty,
    isTouched,
    isValid,
    isValidated,
    errors,
    defineValidator,
    reset,
    validateForm,
    getSubForm,
    submitHandler: onSubmit => makeSubmitHandler(subForm, formOptions ?? {})(onSubmit),
    useFieldArray: (fieldArrayPath, fieldArrayOptions) => {
      return useFieldArray(subForm, fieldArrayPath, fieldArrayOptions)
    },
  }

  return subForm
}
