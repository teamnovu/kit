import { QueryKey, useQuery } from '@tanstack/vue-query'

export function useSuspenseQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = readonly unknown[],
>(...args: Parameters<typeof useQuery<TQueryFnData, TError, TData, TQueryKey>>) {
  const result = useQuery(
    {
      ...args[0],
    },
    args[1],
  )

  return result
}
