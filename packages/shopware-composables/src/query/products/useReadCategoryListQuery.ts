import { queryOptions, useQuery } from '@tanstack/vue-query'
import type { OperationKey, OperationOptions } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { unrefOptions } from '../../util/unrefOptions'
import { categoryKeys } from '../../keys'

const readCategoryListOperation = 'readCategoryList post /category' satisfies OperationKey

export const useReadCategoryListQueryOptions = function useReadCategoryListQueryOptions(
  options?: OperationOptions<typeof readCategoryListOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = categoryKeys.list(options)

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query(readCategoryListOperation, unrefOptions(options))
    },
  })
}

export function useReadCategoryListQuery(options?: OperationOptions<typeof readCategoryListOperation>) {
  return useQuery(useReadCategoryListQueryOptions(options))
}
