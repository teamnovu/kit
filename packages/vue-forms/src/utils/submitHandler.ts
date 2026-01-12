import type { Awaitable, MaybeRef } from '@vueuse/core'
import { unref } from 'vue'
import type { Form, FormDataDefault } from '../types/form'
import type { ValidationStrategy } from '../types/validation'
import { isValidResult } from './validation'

interface SubmitHandlerOptions {
  validationStrategy?: MaybeRef<ValidationStrategy>
}

export function makeSubmitHandler<T extends FormDataDefault, TOut = T>(
  form: Form<T, TOut>,
  options: SubmitHandlerOptions,
) {
  return (onSubmit: (data: TOut) => Awaitable<void>) => {
    return async (event?: SubmitEvent) => {
      event?.preventDefault()
      const strategy = unref(options.validationStrategy)

      if (strategy === 'none') {
        // Casting to unknown and TOut should be fine here
        // because the user chose specifically not to validate
        await onSubmit(form.data.value as unknown as TOut)
        return
      }

      const result = await form.validateForm()

      if (!isValidResult(result)) {
        return
      }

      // Use validated data if available, otherwise fall back to form data
      const data = result.data ?? form.data.value
      await onSubmit(data as unknown as TOut)
    }
  }
}
