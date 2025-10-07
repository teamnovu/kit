import { computed, unref } from 'vue'
import type { AnyField, FormDataDefault } from '../types/form'
import type { FieldRegistry } from './useFieldRegistry'

export function useFormState<T extends FormDataDefault>(
  formFieldRegistry: FieldRegistry<T>,
) {
  const isDirty = computed(() => {
    return formFieldRegistry.fields.value.some((field: AnyField<T>) => unref(field.dirty))
  })

  const isTouched = computed(() => {
    return formFieldRegistry.fields.value.some((field: AnyField<T>) => unref(field.touched))
  })

  return {
    isDirty,
    isTouched,
  }
}
