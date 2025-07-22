import { computed, unref } from 'vue'
import type { FormDataDefault } from '../types/form'
import type { FieldRegistry } from './useFieldRegistry'

export function useFormState<T extends FormDataDefault>(
  formFieldRegistry: FieldRegistry<T>,
) {
  const isDirty = computed(() => {
    return formFieldRegistry.getFields().some(field => unref(field.dirty))
  })

  const isTouched = computed(() => {
    return formFieldRegistry.getFields().some(field => unref(field.touched))
  })

  return {
    isDirty,
    isTouched,
  }
}
