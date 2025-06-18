import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys } from '../../keys'
import { unrefOptions } from '../../util'
import type { OperationKey, OperationOptions } from '../types/query'

const readCartOperation = 'readCart get /checkout/cart' satisfies OperationKey

export function useReadCartQueryOptions(
  options?: OperationOptions<typeof readCartOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = cartKeys.get()

  return queryOptions({
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
  return useQuery(useReadCartQueryOptions())
}
