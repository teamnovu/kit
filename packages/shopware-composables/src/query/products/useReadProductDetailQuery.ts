import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { productKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'
import { unref, type MaybeRef } from 'vue'

const readProductDetailOperation = 'readProductDetail post /product/{productId}' satisfies OperationKey

export function useReadProductDetailQueryOptions(
  productId: MaybeRef<string>,
  body?: OperationOptions<typeof readProductDetailOperation, 'params'>,
) {
  const client = useShopwareQueryClient()
  const queryKey = productKeys.detail(productId, body)

  return queryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const opts = unrefOptions(body)
      return client.query(readProductDetailOperation, {
        ...opts,
        params: {
          ...opts.params,
          productId: unref(productId),
        },
        signal,
      })
    },
  })
}

export function useReadProductDetailQuery(
  productId: MaybeRef<string>,
  body?: OperationOptions<typeof readProductDetailOperation, 'params'>,
) {
  return useQuery(useReadProductDetailQueryOptions(productId, body))
}
