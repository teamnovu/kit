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
import type { Form, FormDataDefault } from '../types/form'
import type { ValidationStrategy } from '../types/validation'
import { cloneRefValue } from '../utils/general'
import { makeSubmitHandler } from '../utils/submitHandler'
import { useFieldArray } from './useFieldArray'
import { useFieldRegistry } from './useFieldRegistry'
import { useFormState } from './useFormState'
import { createSubformInterface } from './useSubform'
import { useValidation, type ValidationOptions } from './useValidation'

export interface UseFormOptions<T extends FormDataDefault>
  extends ValidationOptions<T> {
  initialData: MaybeRefOrGetter<T>
  validationStrategy?: MaybeRef<ValidationStrategy>
  keepValuesOnUnmount?: MaybeRef<boolean>
}

export function useForm<T extends FormDataDefault>(
  options: UseFormOptions<T>,
): Form<T> {
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

  const form: Form<T> = {
    ...fieldRegistry,
    ...validationState,
    ...formState,
    reset,
    initialData: toRef(state, 'initialData') as Form<T>['initialData'],
    data: toRef(state, 'data') as Form<T>['data'],
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
