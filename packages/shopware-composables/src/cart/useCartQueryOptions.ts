import { operations } from '#store-types'
import { queryOptions } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../inject'
import { cartKeys } from '../keys'
import type { OperationKey } from '../types/query'

const readCartOperation = 'readCart get /checkout/cart' satisfies OperationKey

export function useCartQueryOptions<Operations extends operations>() {
  const client = useShopwareQueryClient<Operations>()
  const queryKey = cartKeys.get()

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query(readCartOperation)
    },
  })
}
