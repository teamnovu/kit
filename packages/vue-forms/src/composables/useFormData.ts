import { ref, type Ref, unref, watch } from 'vue'
import type { FormDataDefault } from '../types/form'

export function useFormData<T extends FormDataDefault>(
  initialData: Ref<T>,
) {
  const data = ref(unref(initialData)) as Ref<T>

  watch(initialData, (newData) => {
    if (newData !== data.value) {
      data.value = newData
    }
  })

  return { data }
}
