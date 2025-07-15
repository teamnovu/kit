import { reactive, unref } from 'vue'
import type { FormDataDefault } from '../types/form'
import type { Paths, PickDot } from '../types/util'
import { useField, type FormField, type UseFieldOptions } from './useField'

export type FormFieldRegistry<T extends FormDataDefault> = Map<Paths<T>, FormField<unknown>>

export function useFieldRegistry<T extends FormDataDefault>() {
  const fields: FormFieldRegistry<T> = reactive(new Map())

  function registerField(field: FormField<unknown>) {
    fields.set(unref(field.path) as Paths<T>, field)
  }

  function getField<K extends Paths<T>>(path: K) {
    return fields.get(path) as FormField<PickDot<T, K>> | undefined
  }

  function defineField(options: UseFieldOptions<unknown>) {
    // TODO: Pass values from form
    const field = useField(options)

    registerField(field)

    return field
  }

  return {
    fields,
    getField,
    registerField,
    defineField,
  }
}
