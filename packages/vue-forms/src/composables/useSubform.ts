import { computed, unref, type Ref } from 'vue'
import type { Form, FormDataDefault, FormField } from '../types/form'
import type { EntityPaths, Paths, PickEntity, PickProps } from '../types/util'
import { filterErrorsForPath, getLens, getNestedValue, joinPath } from '../utils/path'
import type { DefineFieldOptions } from './useFieldRegistry'
import type { UseFormOptions } from './useForm'

export interface SubformOptions<T extends FormDataDefault> extends Omit<UseFormOptions<T>, 'initialData'> {
  // Additional subform-specific options can be added here
}

export function createSubformInterface<
  T extends FormDataDefault,
  K extends EntityPaths<T>,
>(
  mainForm: Form<T>,
  path: K,
  options?: SubformOptions<PickEntity<T, K>>,
): Form<PickEntity<T, K>> {
  type ST = PickEntity<T, K>
  type SP = Paths<ST>
  type MP<P extends SP> = `${K}.${P}`
  type ScopedMainPaths = Paths<T> & MP<SP>

  // Create reactive data scoped to subform path
  const formData = getLens(mainForm.formData, path) as Ref<ST>

  const initialData = computed(() => {
    return getNestedValue(mainForm.initialData.value, path) as ST
  })

  const adaptMainFormField = <S extends SP>(
    field: FormField<PickProps<T, ScopedMainPaths>, ScopedMainPaths>,
  ): FormField<PickProps<ST, S>, S> => {
    // Where P ist the full path in the main form, we need to adapt it to the subform's path
    return {
      ...field,
      path: computed(() => unref(field.path).replace(path + '.', '')),
      setValue: (newValue: PickProps<ST, S>) => {
        field.setValue(newValue as PickProps<T, ScopedMainPaths>)
      },
    } as unknown as FormField<PickProps<ST, S>, S>
  }

  const getField = <P extends SP>(fieldPath: P) => {
    const fullPath = joinPath(path, fieldPath)
    const mainFormField = mainForm.getField(fullPath as ScopedMainPaths)

    if (!mainFormField) {
      return
    }

    return adaptMainFormField<P>(mainFormField)
  }

  // Field operations with path transformation
  const defineField = <P extends SP>(fieldOptions: DefineFieldOptions<ST, P>) => {
    const fullPath = joinPath(path, fieldOptions.path)

    const mainField = mainForm.defineField({
      ...fieldOptions,
      path: fullPath as ScopedMainPaths,
    })

    return adaptMainFormField<P>(mainField)
  }

  const getFields = <P extends SP>(): FormField<PickProps<ST, P>, P>[] => {
    return (mainForm.getFields() as FormField<PickProps<T, ScopedMainPaths>, ScopedMainPaths>[])
      .filter((field) => {
        const fieldPath = field.path.value
        return fieldPath.startsWith(path + '.') || fieldPath === path
      })
      .map(field => adaptMainFormField(field))
  }

  // State computed from main form with path filtering
  const isDirty = computed(() => getFields().some(field => field.dirty.value))
  const isTouched = computed(() => getFields().some(field => field.touched.value))

  // Validation delegates to main form
  const isValid = computed(() => mainForm.isValid.value)
  const isValidated = computed(() => mainForm.isValidated.value)
  const errors = computed(() => filterErrorsForPath(unref(mainForm.errors), path))

  const validateForm = () => mainForm.validateForm()

  // Nested subforms
  const getSubForm = <P extends EntityPaths<ST>>(
    subPath: P,
    subOptions?: SubformOptions<PickEntity<ST, P>>,
  ) => {
    const fullPath = joinPath(path, subPath) as EntityPaths<T>
    return mainForm.getSubForm(
      fullPath,
      subOptions as SubformOptions<PickEntity<T, typeof fullPath>>,
    ) as Form<PickEntity<ST, P>>
  }

  // Reset scoped to this subform
  const reset = () => getFields().forEach(field => field.reset())

  return {
    formData,
    initialData,
    defineField,
    getField,
    getFields,
    isDirty,
    isTouched,
    isValid,
    isValidated,
    errors,
    reset,
    validateForm,
    getSubForm,
  }
}
