import { shopwareQueryOptions } from '../../util/shopwareQueryOptions'
import { useShopwareQueryClient } from '../../inject'
import { useShopwareQuery } from '../../util/useShopwareQuery'
import { productKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const searchSuggestOperation = 'searchSuggest post /search-suggest' satisfies OperationKey

export function useSearchSuggestQueryOptions(
  body?: OperationOptions<typeof searchSuggestOperation, 'params'>,
) {
  const client = useShopwareQueryClient()
  const queryKey = productKeys.searchSuggest(body)

  return shopwareQueryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const opts = unrefOptions(body)
      return client.query(searchSuggestOperation, {
        ...opts,
        signal,
      })
    },
  })
}

export function useSearchSuggestQuery(
  body?: OperationOptions<typeof searchSuggestOperation, 'params'>,
) {
  return useShopwareQuery(useSearchSuggestQueryOptions(body))
}
