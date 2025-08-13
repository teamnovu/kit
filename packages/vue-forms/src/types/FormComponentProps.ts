import type { ObjectOf, Paths } from './util'
import type { Form } from './form'
import type { DeepPartial } from '../utils/type-helpers'

export interface FormComponentProps<
  TData extends object,
  TPath extends Paths<TData>,
  TModelValueType,
> {
  form: Form<TData & DeepPartial<ObjectOf<TPath, TModelValueType>>>
  path: TPath
}

export type ExcludedFieldProps = 'modelValue' | 'onUpdate:modelValue' | 'errors'
