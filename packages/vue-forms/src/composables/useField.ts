import type { Awaitable } from '@vueuse/core'
import { computed, reactive, toRefs, unref, watch, type MaybeRef, type MaybeRefOrGetter, type Ref } from 'vue'
import type { FormField } from '../types/form'
import type { ValidationErrorMessage, ValidationErrors } from '../types/validation'
import { cloneRefValue } from '../utils/general'

export interface UseFieldOptions<T, K extends string> {
  value?: MaybeRef<T>
  initialValue?: MaybeRefOrGetter<Readonly<T>>
  path: K
  errors?: Ref<ValidationErrors>
  existsInForm?: MaybeRef<boolean>
  onBlur?: () => Awaitable<void>
  onFocus?: () => Awaitable<void>
  onChange?: (value: T) => Awaitable<void>
}

export function useField<T, K extends string>(fieldOptions: UseFieldOptions<T, K>): FormField<T, K> {
  const defaultOptions = {
    existsInForm: true,
  }

  const options = {
    ...defaultOptions,
    ...fieldOptions,
  }
  const state = reactive({
    value: options.value,
    path: options.path,
    initialValue: options.initialValue,
    errors: options.errors,
    touched: false,
  })

  watch(() => state.value, (newData) => {
    fieldOptions.onChange?.(newData as T)
  }, { deep: true })

  const dirty = computed(() => {
    return JSON.stringify(state.value) !== JSON.stringify(state.initialValue)
  })

  const setData = (newData: T): void => {
    state.value = newData
  }

  const onBlur = (): void => {
    state.touched = true
    state.errors = []

    options.onBlur?.()
  }

  const onFocus = (): void => {
    options.onFocus?.()
  }

  const reset = (): void => {
    const lastPathPart = state.path.split('.').at(-1) || ''
    if (unref(options.existsInForm) && !/^\d+$/.test(lastPathPart)) {
      state.value = cloneRefValue(state.initialValue as T)
    }
    state.touched = false
    state.errors = []
  }

  // This method is replaced by the registry and should never be called directly.
  // This only acts as a stub.
  const setInitialData = (newData: T, _options?: { replace?: boolean }): void => {
    if (!dirty.value) {
      setData(cloneRefValue(newData))
    }
    // Standalone-mode fallback: when no registry has replaced this method, keep
    // the previous behavior of updating the local baseline directly.
    state.initialValue = newData as typeof state.initialValue
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
    setInitialData,
    onBlur,
    onFocus,
    reset,
    setErrors,
    clearErrors,
  }
}
