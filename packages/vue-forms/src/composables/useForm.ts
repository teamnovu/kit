import {
  computed,
  reactive,
  ref,
  toRef,
  unref,
  watch,
  type MaybeRef,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type { z } from 'zod'
import type { Form, FormDataDefault } from '../types/form'
import type { ValidationStrategy } from '../types/validation'
import { cloneRefValue } from '../utils/general'
import { makeSubmitHandler } from '../utils/submitHandler'
import { useFieldArray } from './useFieldArray'
import { useFieldRegistry } from './useFieldRegistry'
import { useFormState } from './useFormState'
import { createSubformInterface } from './useSubform'
import { useValidation, type ValidationOptions } from './useValidation'

export interface UseFormOptions<T extends FormDataDefault, TOut = T>
  extends ValidationOptions<T, TOut> {
  initialData: MaybeRefOrGetter<T>
  validationStrategy?: MaybeRef<ValidationStrategy>
  keepValuesOnUnmount?: MaybeRef<boolean>
}

/* eslint-disable no-redeclare */
// Overload: with schema - infer types from schema
// initialData can be partial, but provided fields must match schema types
export function useForm<
  T extends FormDataDefault,
  TOut = T,
>(options: UseFormOptions<T, TOut> & { schema: z.ZodType<TOut, T> }): Form<T, TOut>

// Overload: without schema - infer types from initialData
export function useForm<T extends FormDataDefault>(
  options: Omit<UseFormOptions<T, T>, 'schema'> & { schema?: undefined },
): Form<T, T>

// Implementation
export function useForm<T extends FormDataDefault, TOut = T>(
  options: UseFormOptions<T, TOut>,
): Form<T, TOut> {
  /* eslint-enable no-redeclare */
  const initialData = computed(() => cloneRefValue(options.initialData))

  const data = ref<T>(cloneRefValue(initialData)) as Ref<T>

  const state = reactive({
    initialData,
    data,
  })

  watch(
    initialData,
    (newValue) => {
      state.data = cloneRefValue(newValue)
    },
    { flush: 'sync' },
  )

  const validationState = useValidation(state, options)
  const fieldRegistry = useFieldRegistry(state, validationState, {
    keepValuesOnUnmount: options.keepValuesOnUnmount,
    onBlur: async (path: string) => {
      if (unref(options.validationStrategy) === 'onTouch') {
        validationState.validateField(path)
      }
    },
  })
  const formState = useFormState(fieldRegistry)

  const reset = () => {
    data.value = cloneRefValue(initialData)
    validationState.reset()
    for (const field of fieldRegistry.fields.value) {
      field.reset()
    }
  }

  if (unref(options.validationStrategy) === 'onFormOpen') {
    validationState.validateForm()
  }

  const form: Form<T, TOut> = {
    ...fieldRegistry,
    ...validationState,
    ...formState,
    reset,
    initialData: toRef(state, 'initialData') as Form<T>['initialData'],
    data: toRef(state, 'data') as Form<T>['data'],
    validateForm: validationState.validateForm as Form<T, TOut>['validateForm'],
    submitHandler: onSubmit => makeSubmitHandler(form, options)(onSubmit),
    getSubForm: (path, subformOptions) => {
      return createSubformInterface(form, path, options, subformOptions)
    },
    getFieldArray: (path, fieldArrayOptions) => {
      return useFieldArray(form, path, fieldArrayOptions)
    },
  }

  return form
}
