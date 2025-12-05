import { computed, reactive, shallowRef, toRefs, watch, type MaybeRef, type MaybeRefOrGetter, type Ref } from 'vue'
import type { FormField } from '../types/form'
import type { ValidationErrorMessage, ValidationErrors } from '../types/validation'
import { cloneRefValue } from '../utils/general'
import type { Awaitable } from '@vueuse/core'

export interface UseFieldOptions<T, K extends string> {
  value?: MaybeRef<T>
  initialValue?: MaybeRefOrGetter<Readonly<T>>
  path: K
  errors?: Ref<ValidationErrors>
  onBlur?: () => Awaitable<void>
  onFocus?: () => Awaitable<void>
}

export function useField<T, K extends string>(options: UseFieldOptions<T, K>): FormField<T, K> {
  const initialValue = shallowRef(Object.freeze(cloneRefValue(options.initialValue))) as Ref<Readonly<T | undefined>>

  const state = reactive({
    value: options.value,
    path: options.path,
    initialValue,
    errors: options.errors,
    touched: false,
  })

  watch(
    shallowRef(options.initialValue),
    () => {
      initialValue.value = Object.freeze(cloneRefValue(options.initialValue))
      state.value = cloneRefValue(options.initialValue)
    },
    { flush: 'sync' },
  )

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
    state.value = cloneRefValue(state.initialValue)
    state.touched = false
    state.errors = []
  }

  const setInitialData = (newData: T): void => {
    if (!dirty.value) {
      setData(cloneRefValue(newData))
    }
    state.initialValue = newData
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
