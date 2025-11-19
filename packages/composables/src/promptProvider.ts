import { provide, type Ref, ref } from 'vue'
import {
  type ResultingPromptAnswer, type ResultingPromptInvokeOptions, promptKey,
  type BrandedResultingPromptInvokeOptions,
} from './injects/promptContext'

export default function usePromptProvider() {
  const isOpen = ref(false)
  const resolveFunction = ref<(value: ResultingPromptAnswer) => void>()
  const promptOptions = ref(undefined) as Ref<BrandedResultingPromptInvokeOptions | undefined>

  const resolve = (value: ResultingPromptAnswer) => {
    isOpen.value = false
    resolveFunction.value?.(value)
    resolveFunction.value = undefined
  }

  provide(promptKey, (options: ResultingPromptInvokeOptions) => {
    isOpen.value = true
    promptOptions.value = options as BrandedResultingPromptInvokeOptions
    return new Promise<ResultingPromptAnswer>((_resolve) => {
      resolveFunction.value = _resolve
    })
  })

  return {
    isOpen,
    resolve,
    promptOptions,
  }
}
