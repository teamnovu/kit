import { shopwareQueryOptions } from '../../util/shopwareQueryOptions'
import { useShopwareQueryClient } from '../../inject'
import { useShopwareQuery } from '../../util/useShopwareQuery'
import { productKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const searchPageOperation = 'searchPage post /search' satisfies OperationKey

export function useSearchPageQueryOptions(
  body?: OperationOptions<typeof searchPageOperation, 'params'>,
) {
  const client = useShopwareQueryClient()
  const queryKey = productKeys.search(body)

  return shopwareQueryOptions({
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
  return useShopwareQuery(useSearchPageQueryOptions(body))
}
