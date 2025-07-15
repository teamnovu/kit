import { computed, ref, type Ref, unref, watch } from 'vue'
import type { FormDataDefault } from '../types/form'
import type { Paths, PickDot } from '../types/util'
import { getNestedValue, setNestedValue } from '../utils/path'

export function useFormData<T extends FormDataDefault>(
  initialData: Ref<T>,
) {
  const formData = ref(unref(initialData))

  watch(initialData, (newData) => {
    if (newData !== formData.value) {
      formData.value = newData
    }
  })

  const getLens = <K extends Paths<T>>(key: K) => {
    return computed(() => ({
      get() {
        return getNestedValue(formData.value, key)
      },
      set(value: PickDot<T, K>) {
        setNestedValue(formData.value, key, value)
      },
    }))
  }

  return {
    formData,
    getLens,
  }
}
