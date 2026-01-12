import type { Awaitable } from '@vueuse/core'
import type { ValidationState } from '../composables/useValidation'
import type { Form, FormDataDefault } from '../types/form'
import { isValidResult } from './validation'

export function makeSubmitHandler<T extends FormDataDefault, TOut = T>(
  form: Form<T, TOut>,
  validationState: ValidationState<T, TOut>,
) {
  return (onSubmit: (data: TOut) => Awaitable<void>) => {
    return async (event?: SubmitEvent) => {
      event?.preventDefault()

      if (validationState.canValidate('validateOnSubmit')) {
        const result = await form.validateForm()

        if (!isValidResult(result)) {
          return
        }

        const data = result.data ?? form.data.value

        // Use validated data if available, otherwise fall back to form data
        await onSubmit(data as unknown as TOut)
      } else {
        await onSubmit(form.data.value as unknown as TOut)
      }
    }
  }
}
