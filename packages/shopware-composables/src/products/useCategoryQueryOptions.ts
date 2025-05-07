import { operations } from '#store-types'
import { queryOptions } from '@tanstack/vue-query'
import { MaybeRef, unref } from 'vue'
import { useShopwareQueryClient } from '../inject'
import { categoryKeys } from '../keys'
import { OperationBody, OperationKey } from '../types/query'

const readCategoryListOperation = 'readCategoryList post /category' satisfies OperationKey

export function useCategoryQueryOptions<Operations extends operations>(
  body?: MaybeRef<OperationBody<Operations, typeof readCategoryListOperation>>,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryKey = categoryKeys.list(body)

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query(readCategoryListOperation, {
        body: unref(body),
      })
    },
  })
}
