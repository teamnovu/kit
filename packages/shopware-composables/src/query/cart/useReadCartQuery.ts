import { shopwareQueryOptions } from '../../util/shopwareQueryOptions'
import { useShopwareQueryClient } from '../../inject'
import { useShopwareQuery } from '../../util/useShopwareQuery'
import { cartKeys } from '../../keys'
import { unrefOptions } from '../../util'
import type { OperationKey, OperationOptions } from '../types/query'

const readCartOperation = 'readCart get /checkout/cart' satisfies OperationKey

export function useReadCartQueryOptions(
  options?: OperationOptions<typeof readCartOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = cartKeys.get()

  return shopwareQueryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      return client.query(readCartOperation, {
        ...unrefOptions(options),
        signal,
      })
    },
  })
}

export function useReadCartQuery() {
  return useShopwareQuery(useReadCartQueryOptions())
}
