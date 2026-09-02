import { shopwareQueryOptions } from '../../util/shopwareQueryOptions'
import { useShopwareQueryClient } from '../../inject'
import { useShopwareQuery } from '../../util/useShopwareQuery'
import { orderKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const readOrderOperation = 'readOrder post /order' satisfies OperationKey

export function useReadOrderQueryOptions(
  options?: OperationOptions<typeof readOrderOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = orderKeys.detail(options)

  return shopwareQueryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const opts = unrefOptions(options)
      return client.query(readOrderOperation, {
        ...opts,
        signal,
      })
    },
  })
}

export function useReadOrderQuery(
  options?: OperationOptions<typeof readOrderOperation>,
) {
  return useShopwareQuery(useReadOrderQueryOptions(options))
}
