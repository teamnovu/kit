import { queryOptions, useQuery } from '@tanstack/vue-query'
import type { OperationKey } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys } from '../../keys'

const readCartOperation = 'readCart get /checkout/cart' satisfies OperationKey

export function useReadCartQueryOptions() {
  const client = useShopwareQueryClient()
  const queryKey = cartKeys.get()

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query(readCartOperation)
    },
  })
}

export function useReadCartQuery() {
  return useQuery(useReadCartQueryOptions())
}
