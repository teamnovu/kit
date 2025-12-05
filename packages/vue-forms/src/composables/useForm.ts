import type { Awaitable } from '@vueuse/core'
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
import type { AnyField, Form, FormDataDefault } from '../types/form'
import type { EntityPaths, PickEntity } from '../types/util'
import type { ValidationStrategy } from '../types/validation'
import { cloneRefValue } from '../utils/general'
import { useFieldRegistry } from './useFieldRegistry'
import { useFormState } from './useFormState'
import { createSubformInterface, type SubformOptions } from './useSubform'
import { useValidation, type ValidationOptions } from './useValidation'

// TODO @Elias implement validation strategy handling

export interface UseFormOptions<T extends FormDataDefault>
  extends ValidationOptions<T> {
  initialData: MaybeRefOrGetter<T>
  validationStrategy?: MaybeRef<ValidationStrategy>
  keepValuesOnUnmount?: MaybeRef<boolean>
}

export function useForm<T extends FormDataDefault>(options: UseFormOptions<T>) {
  const initialData = computed(() =>
    Object.freeze(cloneRefValue(options.initialData)))

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
    onBlur: async () => {
      if (unref(options.validationStrategy) === 'onTouch') {
        validationState.validateForm()
      }
    },
  })
  const formState = useFormState(fieldRegistry)

  const submitHandler = (onSubmit: (data: T) => Awaitable<void>) => {
    return async (event: SubmitEvent) => {
      event.preventDefault()

      if (unref(options.validationStrategy) !== 'none') {
        await validationState.validateForm()
      }

      if (!validationState.isValid.value) {
        return
      }

      await onSubmit(state.data)
    }
  }

  const reset = () => {
    data.value = cloneRefValue(initialData)
    validationState.reset()
    fieldRegistry.fields.value.forEach((field: AnyField<T>) => field.reset())
  }

  function getSubForm<K extends EntityPaths<T>>(
    path: K,
    options?: SubformOptions<PickEntity<T, K>>,
  ): Form<PickEntity<T, K>> {
    return createSubformInterface(formInterface, path, options)
  }

  const formInterface: Form<T> = {
    ...fieldRegistry,
    ...validationState,
    ...formState,
    reset,
    getSubForm,
    submitHandler,
    initialData: toRef(state, 'initialData') as Form<T>['initialData'],
    data: toRef(state, 'data') as Form<T>['data'],
  }

  if (unref(options.validationStrategy) === 'onFormOpen') {
    validationState.validateForm()
  }

  return formInterface
}
