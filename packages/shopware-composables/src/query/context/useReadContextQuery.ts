import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { contextKeys } from '../../keys'
import type { OperationKey, OperationOptions } from '../types/query'
import { unrefOptions } from '../../util'

const readContextOperation = 'readContext get /context' satisfies OperationKey

export function useReadContextQueryOptions(
  options?: OperationOptions<typeof readContextOperation>,
) {
  const client = useShopwareQueryClient()

  return queryOptions({
    queryKey: contextKeys.all(),
    queryFn: ({ signal }) =>
      client.query(readContextOperation, {
        ...unrefOptions(options),
        signal,
      }),
  })
}

export function useReadContextQuery(
  options?: OperationOptions<typeof readContextOperation>,
) {
  return useQuery(useReadContextQueryOptions(options))
}
