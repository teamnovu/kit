import { computed, reactive, toRefs, unref, type MaybeRef } from 'vue'
import type { ErrorMessage, PropertyError } from '../types/validation'

export interface UseFieldOptions<T> {
  value?: MaybeRef<T>
  path: MaybeRef<string>
  initialValue?: MaybeRef<T>
  errors?: MaybeRef<PropertyError>
}

export function useField<T>(options: UseFieldOptions<T>) {
  const state = reactive({
    value: options.value,
    path: options.path,
    initialValue: computed(() => structuredClone(unref(options.initialValue))),
    errors: computed(() => unref(options.errors) || []),
    touched: false,
  })

  const dirty = computed(() => {
    return JSON.stringify(state.value) !== JSON.stringify(state.initialValue)
  })

  function setValue(newValue: T): void {
    state.value = newValue
  }

  function onBlur(): void {
    state.touched = true
  }

  function onFocus(): void {
    // TODO: Implement focus logic if needed
  }

  function reset(): void {
    state.value = structuredClone(state.initialValue)
    state.touched = false
    state.errors = []
  }

  function setErrors(newErrors: ErrorMessage[]): void {
    state.errors = newErrors
  }

  function clearErrors(): void {
    state.errors = []
  }

  return {
    ...toRefs(state),
    dirty,
    setValue,
    onBlur,
    onFocus,
    reset,
    setErrors,
    clearErrors,
  }
}

export type FormField<T> = ReturnType<typeof useField<T>>
