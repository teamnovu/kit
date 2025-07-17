import { computed, reactive, ref, toRef, type MaybeRef, type MaybeRefOrGetter, type Ref } from 'vue'
import type { Form, FormDataDefault } from '../types/form'
import type { EntityPaths, PickEntity } from '../types/util'
import type { ValidationStrategy } from '../types/validation'
import { cloneRefValue } from '../utils/general'
import { useFieldRegistry } from './useFieldRegistry'
import { useFormState } from './useFormState'
import { createSubformInterface, type SubformOptions } from './useSubform'
import { useValidation, type ValidationOptions } from './useValidation'

export interface UseFormOptions<T extends FormDataDefault> extends ValidationOptions<T> {
  initialData: MaybeRefOrGetter<T>
  validationStrategy?: MaybeRef<ValidationStrategy>
  keepValuesOnUnmount?: MaybeRef<boolean>
}

export function useForm<T extends FormDataDefault>(options: UseFormOptions<T>) {
  const initialData = computed(() => Object.freeze(cloneRefValue(options.initialData)))

  const formData = ref<T>(cloneRefValue(initialData)) as Ref<T>

  const state = reactive({
    initialData: initialData,
    formData,
  })

  const fields = useFieldRegistry(state)
  const validationState = useValidation(state, options)
  const formState = useFormState(state, fields)

  const reset = () => {
    formData.value = cloneRefValue(initialData)
    fields.getFields().forEach(field => field.reset())
  }

  function getSubForm<K extends EntityPaths<T>>(
    path: K,
    options?: SubformOptions<PickEntity<T, K>>,
  ): Form<PickEntity<T, K>> {
    return createSubformInterface(formInterface, path, options)
  }

  const formInterface: Form<T> = {
    ...fields,
    ...validationState,
    ...formState,
    reset,
    getSubForm,
    initialData: toRef(state, 'initialData') as Form<T>['initialData'],
    formData: toRef(state, 'formData') as Form<T>['formData'],
  }

  return formInterface
}
