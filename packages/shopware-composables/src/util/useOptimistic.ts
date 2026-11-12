import type { MutationOptions, QueryKey, UseMutationOptions } from '@tanstack/vue-query'
import { useShopwareVueQueryClient } from '../inject'
import { toValue, unref } from 'vue'

// https://tanstack.com/query/latest/docs/framework/vue/guides/optimistic-updates#via-the-cache
export function useOptimistic<CacheValue, UpdateValue>(
  queryKey: QueryKey,
  updateFn: (newValue: UpdateValue, oldValue: CacheValue) => CacheValue,
  options?: UseMutationOptions<unknown, unknown, UpdateValue, unknown>,
): MutationOptions<unknown, unknown, UpdateValue, { previousValue?: CacheValue }> {
  const queryClient = useShopwareVueQueryClient()

  return {
    onMutate: async (newValue: UpdateValue, ...rest) => {
      await queryClient.cancelQueries({ queryKey: queryKey })

      const previousValue = queryClient.getQueryData(queryKey) as CacheValue | undefined

      queryClient.setQueryData(queryKey, (oldValue: CacheValue) => updateFn(newValue, oldValue))

      if (options) {
        const opts = unref(toValue(options))
        const onMutate = unref(opts.onMutate)
        onMutate?.(newValue, ...rest)
      }

      return { previousValue }
    },
    onError: (err, newValue: UpdateValue, context, ...rest) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previousValue)
      }

      if (options) {
        const opts = unref(toValue(options))
        const onError = unref(opts.onError)
        onError?.(err, newValue, context, ...rest)
      }
    },
    onSettled: (...args) => {
      queryClient.invalidateQueries({ queryKey })

      if (options) {
        const opts = unref(toValue(options))
        const onSettled = unref(opts.onSettled)
        onSettled?.(...args)
      }
    },
  }
}
