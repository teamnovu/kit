import { computed, reactive, toRefs, unref, type MaybeRef } from 'vue'
import type { FormDataDefault } from '../types/form'
import type { ValidationStrategy } from '../types/validation'
import { useFieldRegistry } from './useFieldManager'
import { useFormState } from './useFormState'
import { useValidation, type ValidationOptions } from './useValidation'

export interface UseFormOptions<T extends FormDataDefault> extends ValidationOptions<T> {
  initialData: MaybeRef<T>
  validationStrategy?: MaybeRef<ValidationStrategy>
  keepValuesOnUnmount?: MaybeRef<boolean>
}

export function useForm<T extends FormDataDefault>(options: UseFormOptions<T>) {
  const initialData = computed(() => structuredClone(unref(options.initialData)))
  const fields = useFieldRegistry<T>()

  const state = reactive({
    initialData: initialData,
    formData: computed(() => unref(initialData)),
    ...toRefs(fields),
  })

  const validationState = useValidation(state, options)
  const formState = useFormState(state)

  return {
    ...toRefs(state),
    ...toRefs(validationState),
    ...toRefs(formState),
  }
}

