import { provide, ref } from 'vue'
import { type ResultingPromptAnswer, type ResultingPromptInvokeOptions, promptKey } from './injects/promptContext'

export default function usePromptProvider() {
  const isOpen = ref(false)
  const resolveFunction = ref<(value: ResultingPromptAnswer) => void>()
  const promptOptions = ref<ResultingPromptInvokeOptions | undefined>(undefined)

  const resolve = (value: ResultingPromptAnswer) => {
    isOpen.value = false
    resolveFunction.value?.(value)
    resolveFunction.value = undefined
    promptOptions.value = undefined
  }

  provide(promptKey, (options: ResultingPromptInvokeOptions) => {
    isOpen.value = true
    promptOptions.value = options
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
