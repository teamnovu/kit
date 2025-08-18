import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { productKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const searchPageOperation = 'searchPage post /search' satisfies OperationKey

export function useSearchPageQueryOptions(
  body?: OperationOptions<typeof searchPageOperation, 'params'>,
) {
  const client = useShopwareQueryClient()
  const queryKey = productKeys.search(body)

  return queryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const opts = unrefOptions(body)
      return client.query(searchPageOperation, {
        ...opts,
        signal,
      })
    },
  })
}

export function useSearchPageQuery(
  body?: OperationOptions<typeof searchPageOperation, 'params'>,
) {
  return useQuery(useSearchPageQueryOptions(body))
}
