import { computed, reactive, toRefs, unref, watch, type MaybeRef, type MaybeRefOrGetter } from 'vue'
import type { ValidationErrorMessage, ValidationErrors } from '../types/validation'
import { cloneRef } from '../utils/general'

export interface UseFieldOptions<T, K extends string> {
  value?: MaybeRef<T>
  initialValue?: MaybeRefOrGetter<Readonly<T>>
  type?: MaybeRef<string>
  required?: MaybeRef<boolean>
  path: MaybeRef<K>
  errors?: MaybeRef<ValidationErrors>
}

export function useField<T, K extends string>(options: UseFieldOptions<T, K>) {
  const state = reactive({
    value: options.value,
    path: options.path,
    initialValue: computed(() => Object.freeze(cloneRef(options.initialValue))),
    errors: unref(options.errors) || [],
    touched: false,
  })

  watch(() => unref(options.errors), (newValue) => {
    state.errors = newValue || []
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
    state.value = cloneRef(state.initialValue)
    state.touched = false
    state.errors = []
  }

  function setErrors(newErrors: ValidationErrorMessage[]): void {
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

export type FormField<T, K extends string> = ReturnType<typeof useField<T, K>>
