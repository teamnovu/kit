import type { Ref } from 'vue'
import type { DefineFieldOptions } from '../composables/useFieldRegistry'
import type { SubformOptions } from '../composables/useSubform'
import type { EntityPaths, Paths, PickEntity, PickProps } from './util'
import type { ErrorBag, ValidationErrorMessage, ValidationErrors, ValidationResult } from './validation'

export type FormDataDefault = object

export interface FormState<T extends FormDataDefault, TIn extends FormDataDefault = T> {
  formData: T
  initialData: TIn
}

export interface FormField<T, P extends string> {
  value: Ref<T>
  path: Ref<P>
  initialValue: Readonly<Ref<T>>
  errors: Ref<ValidationErrors>
  touched: Ref<boolean>
  dirty: Ref<boolean>
  setValue: (newValue: T) => void
  onBlur: () => void
  onFocus: () => void
  reset: () => void
  setErrors: (newErrors: ValidationErrorMessage[]) => void
  clearErrors: () => void
}

export interface Form<T extends FormDataDefault> {
  // Data properties
  formData: Ref<T>
  initialData: Readonly<Ref<T>>

  // Field operations
  defineField: <P extends Paths<T>>(options: DefineFieldOptions<PickProps<T, P>, P>) => FormField<PickProps<T, P>, P>
  getField: <P extends Paths<T>>(path: P) => FormField<PickProps<T, P>, P> | undefined
  getFields: () => FormField<PickProps<T, Paths<T>>, Paths<T>>[]

  // State properties
  isDirty: Ref<boolean>
  isTouched: Ref<boolean>
  isValid: Ref<boolean>
  isValidated: Ref<boolean>
  errors: Ref<ErrorBag>

  // Operations
  reset: () => void
  validateForm: () => Promise<ValidationResult>

  // Nested subforms
  getSubForm: <P extends EntityPaths<T>>(
    path: P,
    options?: SubformOptions<PickEntity<T, P>>,
  ) => Form<PickEntity<T, P>>
}
