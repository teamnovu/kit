import type { Awaitable, MaybeRef } from '@vueuse/core'
import { unref } from 'vue'
import type { Form, FormDataDefault } from '../types/form'
import type { ValidationStrategy } from '../types/validation'

interface SubmitHandlerOptions {
  validationStrategy?: MaybeRef<ValidationStrategy>
}

export function useSubmitHandler<T extends FormDataDefault>(
  form: Omit<Form<T>, 'submitHandler'>,
  options: SubmitHandlerOptions,
) {
  return (onSubmit: (data: T) => Awaitable<void>) => {
    return async (event: SubmitEvent) => {
      event.preventDefault()

      if (unref(options.validationStrategy) !== 'none') {
        await form.validateForm()
      }

      if (!form.isValid.value) {
        return
      }

      await onSubmit(form.data.value)
    }
  }
}
