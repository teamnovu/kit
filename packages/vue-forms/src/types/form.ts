export type FormDataDefault = object

export interface FormState<T extends FormDataDefault, TIn extends FormDataDefault = T> {
  formData: T
  initialData: TIn
}
