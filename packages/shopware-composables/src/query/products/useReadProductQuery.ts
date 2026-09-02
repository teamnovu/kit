import { shopwareQueryOptions } from '../../util/shopwareQueryOptions'
import { useShopwareQueryClient } from '../../inject'
import { useShopwareQuery } from '../../util/useShopwareQuery'
import { productKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const readProductOperation = 'readProduct post /product' satisfies OperationKey

export function useReadProductQueryOptions(
  body?: OperationOptions<typeof readProductOperation, 'params'>,
) {
  const client = useShopwareQueryClient()
  const queryKey = productKeys.headlessDetail(body)

  return shopwareQueryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const opts = unrefOptions(body)
      return client.query(readProductOperation, {
        ...opts,
        signal,
      })
    },
  })
}

export function useReadProductQuery(
  body?: OperationOptions<typeof readProductOperation, 'params'>,
) {
  return useShopwareQuery(useReadProductQueryOptions(body))
}
