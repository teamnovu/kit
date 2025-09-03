import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { productKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const readProductOperation = 'readProduct post /product' satisfies OperationKey

export function useReadProductQueryOptions(
  body?: OperationOptions<typeof readProductOperation, 'params'>,
) {
  const client = useShopwareQueryClient()
  const queryKey = productKeys.detail(body)

  return queryOptions({
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
  return useQuery(useReadProductQueryOptions(body))
}
