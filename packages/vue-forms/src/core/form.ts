import { FieldInstance } from './field'
import type { ErrorMessage, ValidationResult, ValidationStrategy } from '../types/validation'
import { MaybeRef } from 'vue'

export class FormInstance<T extends Record<string, any>> {
  private workingData: T
  private fields: Map<keyof T, FieldInstance<any>> = new Map()
  private validationStrategy: ValidationStrategy

  constructor(initialData: T, validationStrategy: ValidationStrategy = 'onTouch') {
    this.workingData = structuredClone(initialData)
    this.validationStrategy = validationStrategy
  }

  adaptInitialData(initialData: MaybeRef<T>): void {
    this.workingData = 
  }

  getValue<K extends keyof T>(path: K): T[K] {
    return this._workingData[path]
  }

  setValue<K extends keyof T>(path: K, value: T[K]): void {
    this._workingData[path] = value

    // Update field instance if it exists
    const field = this._fields.get(path)
    if (field) {
      field.value.value = value
    }
  }

  getField<K extends keyof T>(path: K): FieldInstance<T[K]> {
    if (!this._fields.has(path)) {
      const field = new FieldInstance(this._workingData[path])
      this._fields.set(path, field)
    }
    return this._fields.get(path)!
  }

  getSubform<K extends keyof T>(path: K): FormInstance<T[K]> {
    const subData = this._workingData[path]
    if (typeof subData !== 'object' || subData === null) {
      throw new Error(`Cannot create subform for non-object value at path: ${String(path)}`)
    }
    return new FormInstance(subData as T[K], this._validationStrategy)
  }

  isDirty(): boolean {
    return JSON.stringify(this._workingData) !== JSON.stringify(this._initialData)
  }

  isTouched(): boolean {
    return Array.from(this._fields.values()).some(field => field.touched.value)
  }

  isValid(): boolean {
    return Array.from(this._fields.values()).every(field => field.errors.value.length === 0)
  }

  async validate(): Promise<ValidationResult> {
    const fieldValidations = await Promise.all(
      Array.from(this._fields.values()).map(field => field.validate()),
    )

    const allErrors = fieldValidations.flatMap(result => result.errors)

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    }
  }

  reset(): void {
    this._workingData = structuredClone(this._initialData)
    this._fields.forEach(field => field.reset())
  }

  async submit(): Promise<void> {
    const validationResult = await this.validate()
    if (!validationResult.isValid) {
      throw new Error('Form validation failed')
    }
    // Submit logic to be implemented
  }

  getErrors(path?: keyof T): ErrorMessage[] {
    if (path) {
      const field = this._fields.get(path)
      return field?.errors.value || []
    }

    return Array.from(this._fields.values()).flatMap(field => field.errors.value)
  }

  hasErrors(path?: keyof T): boolean {
    return this.getErrors(path).length > 0
  }
}
