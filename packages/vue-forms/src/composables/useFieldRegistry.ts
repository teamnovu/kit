import { computed, toRef, unref } from 'vue'
import type { FormDataDefault, FormState } from '../types/form'
import type { Paths, PickProps } from '../types/util'
import { getLens, getNestedValue } from '../utils/path'
import { useField, type FormField, type UseFieldOptions } from './useField'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldRegistryCache<T> = Record<Paths<T>, FormField<any, string>>

export type ResolvedFormField<T, K extends Paths<T>> = FormField<PickProps<T, K>, K>

export type DefineFieldOptions<F, K extends string> = Pick<UseFieldOptions<F, K>, 'path' | 'type' | 'required'>

export function useFieldRegistry<T extends FormDataDefault>(
  formState: FormState<T>,
) {
  const fields = {} as FieldRegistryCache<T>

  function registerField<K extends Paths<T>>(field: ResolvedFormField<T, K>) {
    const path = unref(field.path) as Paths<T>
    fields[path] = field
  }

  function getField<K extends Paths<T>>(path: K) {
    return fields[path] as ResolvedFormField<T, K> | undefined
  }

  function getFields() {
    return Object.values(fields) as ResolvedFormField<T, Paths<T>>[]
  }

  function defineField<K extends Paths<T>>(options: DefineFieldOptions<PickProps<T, K>, K>) {
    const field = useField({
      ...options,
      value: getLens(toRef(formState, 'formData'), options.path),
      initialValue: computed(() => getNestedValue(formState.initialData, unref(options.path))),
    })

    registerField(field)

    return field
  }

  return {
    fields,
    getField,
    getFields,
    registerField,
    defineField,
  }
}

export type FieldRegistry<T extends FormDataDefault> = ReturnType<typeof useFieldRegistry<T>>
