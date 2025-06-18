import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { categoryKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const readCategoryListOperation = 'readCategoryList post /category' satisfies OperationKey

export const useReadCategoryListQueryOptions = function useReadCategoryListQueryOptions(
  options?: OperationOptions<typeof readCategoryListOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = categoryKeys.list(options)

  return queryOptions({
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
  return useQuery(useReadCategoryListQueryOptions(options))
}
