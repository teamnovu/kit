import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { orderKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const readOrderOperation = 'readOrder post /order' satisfies OperationKey

export function useReadOrderQueryOptions(
  options?: OperationOptions<typeof readOrderOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = orderKeys.detail(options)

  return queryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const opts = unrefOptions(options)
      return client.query(readOrderOperation, {
        ...opts,
        signal,
      })
    },
    enabled: !!options,
  })
}

export function useReadOrderQuery(
  options?: OperationOptions<typeof readOrderOperation>,
) {
  return useQuery(useReadOrderQueryOptions(options))
}

