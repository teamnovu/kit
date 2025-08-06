import type { Ref } from 'vue'
import type { DefineFieldOptions } from '../composables/useFieldRegistry'
import type { SubformOptions } from '../composables/useSubform'
import type { EntityPaths, Paths, PickEntity, PickProps } from './util'
import type { ErrorBag, ValidationErrorMessage, ValidationErrors, ValidationResult, Validator } from './validation'
import type { ValidatorOptions } from '../composables/useValidation'

export type FormDataDefault = object

export interface FormField<T, P extends string> {
  data: Ref<T>
  path: Ref<P>
  initialValue: Readonly<Ref<T>>
  errors: Ref<ValidationErrors>
  touched: Ref<boolean>
  dirty: Ref<boolean>
  setData: (newData: T) => void
  onBlur: () => void
  onFocus: () => void
  reset: () => void
  setErrors: (newErrors: ValidationErrorMessage[]) => void
  clearErrors: () => void
}

export type FieldsTuple<T, TPaths = Paths<T>> = [...(
  TPaths extends infer P
    ? P extends string
      ? FormField<PickProps<T, P>, P>
      : never
    : never
)[]]

export type AnyField<T> = FormField<PickProps<T, Paths<T>>, Paths<T>>

export interface Form<T extends FormDataDefault> {
  // Data properties
  data: Ref<T>
  initialData: Readonly<Ref<T>>

  // Field operations
  defineField: <P extends Paths<T>>(options: DefineFieldOptions<PickProps<T, P>, P>) => FormField<PickProps<T, P>, P>
  getField: <P extends Paths<T>>(path: P) => FormField<PickProps<T, P>, P>
  getFields: <TData extends T>() => FieldsTuple<TData>

  // State properties
  isDirty: Ref<boolean>
  isTouched: Ref<boolean>
  isValid: Ref<boolean>
  isValidated: Ref<boolean>
  errors: Ref<ErrorBag>

  defineValidator: <TData extends T>(options: ValidatorOptions<TData> | Ref<Validator<TData>>) => Ref<Validator<TData> | undefined>

  // Operations
  reset: () => void
  validateForm: () => Promise<ValidationResult>

  // Nested subforms
  getSubForm: <P extends EntityPaths<T>>(
    path: P,
    options?: SubformOptions<PickEntity<T, P>>,
  ) => Form<PickEntity<T, P>>
}
