import { shopwareQueryOptions } from '../../util/shopwareQueryOptions'
import { useShopwareQueryClient } from '../../inject'
import { useShopwareQuery } from '../../util/useShopwareQuery'
import { categoryKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const readCategoryListOperation = 'readCategoryList post /category' satisfies OperationKey

export const useReadCategoryListQueryOptions = function useReadCategoryListQueryOptions(
  options?: OperationOptions<typeof readCategoryListOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = categoryKeys.list(options)

  return shopwareQueryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      return client.query(readCategoryListOperation, {
        ...unrefOptions(options),
        signal,
      })
    },
  })
}

export function useReadCategoryListQuery(options?: OperationOptions<typeof readCategoryListOperation>) {
  return useShopwareQuery(useReadCategoryListQueryOptions(options))
}
