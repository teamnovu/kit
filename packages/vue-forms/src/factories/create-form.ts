import { FormInstance } from '../core/form'
import type { ValidationStrategy } from '../types/validation'

export interface CreateFormOptions<T> {
  initialData: T
  validationStrategy?: ValidationStrategy
}

export function createForm<T extends Record<string, any>>(
  options: CreateFormOptions<T>,
): FormInstance<T> {
  return new FormInstance(
    options.initialData,
    options.validationStrategy || 'onTouch',
  )
}

