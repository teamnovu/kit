import { inject, type InjectionKey } from 'vue'

/**
 * Use Module Augmentation to extend or change this interface in your project
 */
export interface PromptInvokeOptions {
}

export interface DefaultPromptInvokeOptions {
  title?: string
  message?: string
  confirmButtonText?: string
  cancelButtonText?: string
}

// If PromptInvokeOptions is empty, use DefaultPromptInvokeOptions
// this allows users to completely override the interface
export type ResultingPromptInvokeOptions = keyof PromptInvokeOptions extends never ? DefaultPromptInvokeOptions : PromptInvokeOptions

// Brand symbol to create nominal type that prevents resolution
declare const __promptOptionsType: unique symbol
export type BrandedResultingPromptInvokeOptions = ResultingPromptInvokeOptions & {
  readonly [__promptOptionsType]: 'ResultingPromptInvokeOptions'
}

/**
 * Use Module Augmentation to extend or change this interface in your project
 */
export interface PromptAnswer {
}

export interface DefaultPromptAnswer {
  ok: boolean
}

// If PromptAnswer is empty, use DefaultPromptInvokeOptions
// this allows users to completely override the interface
export type ResultingPromptAnswer = keyof PromptAnswer extends never ? DefaultPromptAnswer : PromptAnswer

export type PromptFn = (options: ResultingPromptInvokeOptions) => Promise<ResultingPromptAnswer>
export const promptKey = Symbol('jk/prompt') as InjectionKey<PromptFn>

export const usePrompt = () => {
  const promptFn = inject(promptKey)
  if (!promptFn) {
    throw new Error('The prompt function was not properly provided.')
  }
  return promptFn
}
