import type { FormDataDefault } from './form'

export type ValidationStrategy = 'onTouch' | 'onFormOpen' | 'none' | 'preSubmit'

export type ValidationErrorMessage = string
export type ValidationErrors = ValidationErrorMessage[] | undefined

export interface ErrorBag {
  general: ValidationErrors
  propertyErrors: Record<string, ValidationErrors>
}

export interface ValidationResult {
  // TODO @Elias remove isValid
  isValid: boolean
  errors: ErrorBag
}

export interface Validator<T extends FormDataDefault = FormDataDefault> {
  validate: (data: T) => Promise<ValidationResult>
}

export type ValidationFunction<T> = (data: T) => Promise<ValidationResult>
