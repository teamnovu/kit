import { computed, reactive, ref, toRef, type MaybeRef, type MaybeRefOrGetter, type Ref } from 'vue'
import type { Form, FormDataDefault } from '../types/form'
import type { EntityPaths, PickEntity } from '../types/util'
import type { ValidationStrategy } from '../types/validation'
import { cloneRefValue } from '../utils/general'
import { useFieldRegistry } from './useFieldRegistry'
import { useFormState } from './useFormState'
import { createSubformInterface, type SubformOptions } from './useSubform'
import { useValidation, type ValidationOptions } from './useValidation'

// TODO @Elias implement validation strategy handling

export interface UseFormOptions<T extends FormDataDefault> extends ValidationOptions<T> {
  initialData: MaybeRefOrGetter<T>
  validationStrategy?: MaybeRef<ValidationStrategy>
  keepValuesOnUnmount?: MaybeRef<boolean>
}

export function useForm<T extends FormDataDefault>(options: UseFormOptions<T>) {
  const initialData = computed(() => Object.freeze(cloneRefValue(options.initialData)))

  const data = ref<T>(cloneRefValue(initialData)) as Ref<T>

  const state = reactive({
    initialData: initialData,
    data,
  })

  const fields = useFieldRegistry(state)
  const validationState = useValidation(state, options)
  const formState = useFormState(fields)

  const reset = () => {
    data.value = cloneRefValue(initialData)
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
    data: toRef(state, 'data') as Form<T>['data'],
  }

  return formInterface
}
