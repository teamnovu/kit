import type { FormDataDefault } from './form'

export type ValidationStrategy = 'onTouch' | 'onFormOpen' | 'none' | 'onSubmit' | 'onDataChange'

export type ValidationErrorMessage = string
export type ValidationErrors = ValidationErrorMessage[] | undefined

export interface ErrorBag {
  general: ValidationErrors
  propertyErrors: Record<string, ValidationErrors>
}

export interface ValidationResult<T> {
  errors: ErrorBag
  data?: T
}

export interface Validator<T extends FormDataDefault = FormDataDefault, TOut = T> {
  validate: (data: T) => Promise<ValidationResult<TOut>>
}

export type ValidationFunction<T, TOut = T> = (data: T) => Promise<ValidationResult<TOut>>
