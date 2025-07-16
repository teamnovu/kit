import { computed, unref } from 'vue'
import type { FormDataDefault, FormState } from '../types/form'
import type { FieldRegistry } from './useFieldRegistry'

export function useFormState<T extends FormDataDefault>(
  formState: FormState<T>,
  formFieldRegistry: FieldRegistry<T>,
) {
  const isDirty = computed(() => {
    return JSON.stringify(formState.formData) !== JSON.stringify(formState.initialData)
  })

  const isTouched = computed(() => {
    return formFieldRegistry.getFields().some(field => unref(field.touched))
  })

  return {
    isDirty,
    isTouched,
  }
}
