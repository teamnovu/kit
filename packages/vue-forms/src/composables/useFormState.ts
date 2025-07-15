import { computed } from 'vue'
import type { FormDataDefault } from '../types/form'
import type { FormFieldRegistry } from './useFieldManager'

export function useFormState<T extends FormDataDefault>(
  formState: {
    formData: T
    initialData: T
    fields: FormFieldRegistry<T>
  },
) {
  const isDirty = computed(() => {
    return JSON.stringify(formState.formData) !== JSON.stringify(formState.initialData)
  })

  const isTouched = computed(() => {
    return Array.from(formState.fields.values()).some(field => field.touched.value)
  })

  const isValid = computed(() => {
    return Array.from(
      formState.fields.values(),
    ).every(
      field => Array.isArray(field.errors.value) ? field.errors.value.length === 0 : field.errors.value == null,
    )
  })

  return {
    isDirty,
    isTouched,
    isValid,
  }
}
