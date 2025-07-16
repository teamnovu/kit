import { computed, reactive, ref, toRefs, type MaybeRef, type MaybeRefOrGetter, type Ref } from 'vue'
import type { FormDataDefault } from '../types/form'
import type { ValidationStrategy } from '../types/validation'
import { cloneRef } from '../utils/general'
import { useFieldRegistry } from './useFieldRegistry'
import { useFormState } from './useFormState'
import { useValidation, type ValidationOptions } from './useValidation'

export interface UseFormOptions<T extends FormDataDefault> extends ValidationOptions<T> {
  initialData: MaybeRefOrGetter<T>
  validationStrategy?: MaybeRef<ValidationStrategy>
  keepValuesOnUnmount?: MaybeRef<boolean>
}

export function useForm<T extends FormDataDefault>(options: UseFormOptions<T>) {
  const initialData = computed(() => Object.freeze(cloneRef(options.initialData)))

  const formData = ref<T>(cloneRef(initialData)) as Ref<T>

  const state = reactive({
    initialData: initialData,
    formData,
  })

  const fields = useFieldRegistry(state)
  const validationState = useValidation(state, options)
  const formState = useFormState(state, fields)

  function reset() {
    formData.value = cloneRef(initialData)
    fields.getFields().forEach(field => field.reset())
  }

  return {
    ...toRefs(state),
    ...fields,
    ...validationState,
    ...formState,
    reset,
  }
}
