import type { MutationOptions, QueryKey, UseMutationOptions } from '@tanstack/vue-query'
import { useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'

// https://tanstack.com/query/latest/docs/framework/vue/guides/optimistic-updates#via-the-cache
export function useOptimistic<CacheValue, UpdateValue>(
  queryKey: QueryKey,
  updateFn: (newValue: UpdateValue, oldValue: CacheValue) => CacheValue,
  options?: UseMutationOptions<unknown, unknown, UpdateValue, unknown>,
) {
  const queryClient = useQueryClient()

  return {
    onMutate: async (newValue: UpdateValue) => {
      await queryClient.cancelQueries({ queryKey: queryKey })

      const previousValue = queryClient.getQueryData(queryKey) as CacheValue | undefined

      queryClient.setQueryData(queryKey, (oldValue: CacheValue) => updateFn(newValue, oldValue))

      if (options) {
        const opts = unref(options)
        const onMutate = unref(opts.onMutate)
        onMutate?.(newValue)
      }

      return { previousValue }
    },
    onError: (err, newValue: UpdateValue, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previousValue)
      }

      if (options) {
        const opts = unref(options)
        const onError = unref(opts.onError)
        onError?.(err, newValue, context)
      }
    },
    onSettled: (...args) => {
      queryClient.invalidateQueries({ queryKey })

      if (options) {
        const opts = unref(options)
        const onSettled = unref(opts.onSettled)
        onSettled?.(...args)
      }
    },
  } satisfies MutationOptions<unknown, unknown, UpdateValue, { previousValue?: CacheValue }>
}
