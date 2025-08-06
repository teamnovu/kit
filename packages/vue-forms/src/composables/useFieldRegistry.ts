import { computed, toRef, unref } from 'vue'
import type { FieldsTuple, FormDataDefault, FormField } from '../types/form'
import type { Paths, PickProps } from '../types/util'
import { getLens, getNestedValue } from '../utils/path'
import { getEmptyField, useField, type UseFieldOptions } from './useField'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldRegistryCache<T> = Record<Paths<T>, FormField<any, string>>

export type ResolvedFormField<T, K extends Paths<T>> = FormField<PickProps<T, K>, K>

export type DefineFieldOptions<F, K extends string> = Pick<UseFieldOptions<F, K>, 'path'>

interface FormState<T extends FormDataDefault, TIn extends FormDataDefault = T> {
  data: T
  initialData: TIn
}

export function useFieldRegistry<T extends FormDataDefault>(
  formState: FormState<T>,
) {
  const fields = {} as FieldRegistryCache<T>

  const registerField = <K extends Paths<T>>(field: ResolvedFormField<T, K>) => {
    const path = unref(field.path) as Paths<T>
    fields[path] = field
  }

  const getField = <K extends Paths<T>>(path: K): ResolvedFormField<T, K> => {
    if (!(path in fields)) {
      console.warn(`Field with path "${path}" is not registered.`)

      return getEmptyField() as ResolvedFormField<T, K>
    }

    return fields[path] as ResolvedFormField<T, K>
  }

  const getFields = <TData extends T>() => {
    return Object.values(fields) as FieldsTuple<TData>
  }

  const defineField = <K extends Paths<T>>(options: DefineFieldOptions<PickProps<T, K>, K>) => {
    const field = useField({
      ...options,
      value: getLens(toRef(formState, 'data'), options.path),
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
