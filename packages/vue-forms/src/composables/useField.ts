import { computed, reactive, toRefs, unref, watch, type MaybeRef, type MaybeRefOrGetter } from 'vue'
import type { FormField } from '../types/form'
import type { ValidationErrorMessage, ValidationErrors } from '../types/validation'
import { cloneRefValue } from '../utils/general'

export interface UseFieldOptions<T, K extends string> {
  value?: MaybeRef<T>
  initialValue?: MaybeRefOrGetter<Readonly<T>>
  path: K
  errors?: MaybeRef<ValidationErrors>
}

export function useField<T, K extends string>(options: UseFieldOptions<T, K>): FormField<T, K> {
  const state = reactive({
    value: options.value,
    path: options.path,
    initialValue: computed(() => Object.freeze(cloneRefValue(options.initialValue))),
    errors: unref(options.errors) || [],
    touched: false,
  })

  watch(() => unref(options.errors), (newValue) => {
    state.errors = newValue || []
  })

  const dirty = computed(() => {
    return JSON.stringify(state.value) !== JSON.stringify(state.initialValue)
  })

  const setData = (newData: T): void => {
    state.value = newData
  }

  const onBlur = (): void => {
    state.touched = true
  }

  const onFocus = (): void => {
    // TODO: Implement focus logic if needed
  }

  const reset = (): void => {
    state.value = cloneRefValue(state.initialValue)
    state.touched = false
    state.errors = []
  }

  const setErrors = (newErrors: ValidationErrorMessage[]): void => {
    state.errors = newErrors
  }

  const clearErrors = (): void => {
    state.errors = []
  }

  const refs = toRefs(state)

  return {
    data: refs.value as FormField<T, K>['data'],
    path: refs.path as FormField<T, K>['path'],
    initialValue: refs.initialValue as FormField<T, K>['initialValue'],
    errors: refs.errors as FormField<T, K>['errors'],
    touched: refs.touched as FormField<T, K>['touched'],
    dirty,
    setData,
    onBlur,
    onFocus,
    reset,
    setErrors,
    clearErrors,
  }
}
