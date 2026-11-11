import type * as VueQuery from '@tanstack/vue-query'

const callbackNames = ['onMutate', 'onSuccess', 'onError', 'onSettled'] as const

type CallbackName = typeof callbackNames[number]

/**
 * Arguments vue-query passed to the callbacks of every `useMutation` call,
 * i.e. what the composables under test received before forwarding.
 */
export const providedArgs: Record<CallbackName, unknown[][]> = {
  onMutate: [],
  onSuccess: [],
  onError: [],
  onSettled: [],
}

export function clearProvidedArgs() {
  for (const name of callbackNames) {
    providedArgs[name].length = 0
  }
}

function recordCallbacks(options: Record<string, unknown>) {
  const recorded = { ...options }

  for (const name of callbackNames) {
    const callback = options[name]

    if (typeof callback === 'function') {
      recorded[name] = (...args: unknown[]) => {
        providedArgs[name].push(args)
        return callback(...args)
      }
    }
  }

  return recorded
}

/**
 * Use as `vi.mock('@tanstack/vue-query', ...)` factory result.
 */
export function withRecordedMutationCallbacks(vueQuery: typeof VueQuery): typeof VueQuery {
  const useMutation = (options: Record<string, unknown>, queryClient?: VueQuery.QueryClient) =>
    vueQuery.useMutation(recordCallbacks(options), queryClient)

  return {
    ...vueQuery,
    useMutation: useMutation as typeof vueQuery.useMutation,
  }
}
