import type { FormDataDefault } from './form'

export type ValidationStrategy = 'onTouch' | 'onFormOpen' | 'none' | 'preSubmit'

export type ErrorMessage = string
export type PropertyError = ErrorMessage | ErrorMessage[] | undefined

export interface ErrorBag {
  general: ErrorMessage[]
  propertyErrors: Record<string, PropertyError>
}

export interface ValidationResult {
  isValid: boolean
  errors: ErrorBag
}

export interface Validator<T extends FormDataDefault = FormDataDefault> {
  validate: (data: T) => Promise<ValidationResult>
}

export type ValidationFunction<T> = (data: T) => Promise<ValidationResult>
