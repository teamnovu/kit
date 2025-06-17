import { MutationOptions, QueryKey, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'

// https://tanstack.com/query/latest/docs/framework/vue/guides/optimistic-updates#via-the-cache
export function useOptimistic<UpdateValue, CacheValue>(
  options: UseMutationOptions<unknown, unknown, UpdateValue, unknown>,
  queryKey: QueryKey,
  updateFn: (data: CacheValue, newValue: UpdateValue) => CacheValue,
) {
  const queryClient = useQueryClient()

  return {
    onMutate: async (newValue: UpdateValue) => {
      await queryClient.cancelQueries({ queryKey: queryKey })

      const previousValue = queryClient.getQueryData(queryKey) as CacheValue | undefined

      queryClient.setQueryData(queryKey, (oldValue: CacheValue) => updateFn(oldValue, newValue))

      const opts = unref(options)
      const onMutate = unref(opts.onMutate)
      onMutate?.(newValue)

      return { previousValue }
    },
    onError: (err, newValue: UpdateValue, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previousValue)
      }

      const opts = unref(options)
      const onError = unref(opts.onError)
      onError?.(err, newValue, context)
    },
    onSettled: (...args) => {
      queryClient.invalidateQueries({ queryKey })

      const opts = unref(options)
      const onSettled = unref(opts.onSettled)
      onSettled?.(...args)
    },
  } satisfies MutationOptions<unknown, unknown, UpdateValue, { previousValue?: CacheValue }>
}
