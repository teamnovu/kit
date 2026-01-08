import type { Awaitable } from '@vueuse/core'
import type { Ref, ShallowRef } from 'vue'
import type { DefineFieldOptions } from '../composables/useFieldRegistry'
import type { SubformOptions } from '../composables/useSubform'
import type { ValidatorOptions } from '../composables/useValidation'
import type { EntityPaths, Paths, PickEntity, PickProps } from './util'
import type {
  ErrorBag,
  ValidationErrorMessage,
  ValidationErrors,
  ValidationResult,
  Validator,
} from './validation'

export type FormDataDefault = object

export type HashFn<H, I> = (item: I) => H

export interface FieldArrayOptions<Item> {
  hashFn?: HashFn<unknown, Item>
}

export interface FieldItem<Item, Path extends string> {
  id: string
  item: Item
  path: `${Path}.${number}`
}

export interface FieldArray<Item, Path extends string> {
  items: ShallowRef<FieldItem<Item, Path>[]>
  push: (item: Item) => FieldItem<Item, Path>
  remove: (id: string) => void
  field: FormField<Item[], Path>
}

export interface FormField<T, P extends string> {
  data: Ref<T>
  path: Ref<P>
  initialValue: Readonly<Ref<T>>
  errors: Ref<ValidationErrors>
  touched: Ref<boolean>
  dirty: Ref<boolean>
  setData: (newData: T) => void
  /**
   * Sets the initial data for the field. If the field is not dirty, it also updates the current data.
   * @param newData - The new initial data to set.
   */
  setInitialData: (newData: T) => void
  onBlur: () => void
  onFocus: () => void
  reset: () => void
  setErrors: (newErrors: ValidationErrorMessage[]) => void
  clearErrors: () => void
}

export type FieldsTuple<T, TPaths = Paths<T>> = [
  ...(TPaths extends infer P
    ? P extends string
      ? FormField<PickProps<T, P>, P>
      : never
    : never)[],
]

export type AnyField<T> = FormField<PickProps<T, Paths<T>>, Paths<T>>

export interface Form<T extends FormDataDefault> {
  // Data properties
  data: Ref<T>
  initialData: Readonly<Ref<T>>

  fields: Ref<FieldsTuple<T>>

  // Field operations
  defineField: <P extends Paths<T>>(
    options: DefineFieldOptions<PickProps<T, P>, P>,
  ) => FormField<PickProps<T, P>, P>
  getField: <P extends Paths<T>>(path: P) => FormField<PickProps<T, P>, P>

  // State properties
  isDirty: Ref<boolean>
  isTouched: Ref<boolean>
  isValid: Ref<boolean>
  isValidated: Ref<boolean>
  errors: Ref<ErrorBag>

  defineValidator: <TData extends T>(
    options: ValidatorOptions<TData> | Ref<Validator<TData>>,
  ) => Ref<Validator<TData> | undefined>

  // Operations
  reset: () => void
  validateForm: () => Promise<ValidationResult>

  submitHandler: (
    onSubmit: (data: T) => Awaitable<void>,
  ) => (event: SubmitEvent) => Promise<void>

  // Nested subforms
  getSubForm: <P extends EntityPaths<T>>(
    path: P,
    options?: SubformOptions<PickEntity<T, P>>,
  ) => Form<PickEntity<T, P>>

  // Field arrays
  useFieldArray: <K extends Paths<T>>(
    path: PickProps<T, K> extends unknown[] ? K : never,
    options?: FieldArrayOptions<
      PickProps<T, K> extends (infer U)[] ? U : never
    >,
  ) => FieldArray<PickProps<T, K> extends (infer U)[] ? U : never>
}
