import { ref, type Ref, unref, watch } from 'vue'
import type { FormDataDefault } from '../types/form'

export function useFormData<T extends FormDataDefault>(
  initialData: Ref<T>,
) {
  const formData = ref(unref(initialData))

  watch(initialData, (newData) => {
    if (newData !== formData.value) {
      formData.value = newData
    }
  })

  return { formData }
}
