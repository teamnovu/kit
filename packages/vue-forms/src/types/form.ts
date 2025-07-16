export type FormDataDefault = Record<string, unknown>

export interface FormState<T extends FormDataDefault> {
  formData: T
  initialData: T
}
