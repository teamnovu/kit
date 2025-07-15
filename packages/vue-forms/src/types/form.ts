import type { ValidationState } from "../composables/useValidation"

export type FormDataDefault = Record<string, unknown>

export interface FormState<T extends FormDataDefault> extends ValidationState<T> {
  formData: T
  initialData: T

  isDirty: boolean
  isTouched: boolean
}
