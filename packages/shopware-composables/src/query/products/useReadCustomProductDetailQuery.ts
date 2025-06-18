import { queryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { productKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import { relativizeSeoUrl } from '../../util/url'
import type { OperationKey, OperationOptions } from '../types/query'

// eslint-disable-next-line @stylistic/max-len
const readCustomProductDetailOperation = 'readCustomProductDetail post /novu/headless/product/{seoUrl}' satisfies OperationKey

export function useReadCustomProductDetailOptions(
  seoUrl: MaybeRef<string>,
  body?: OperationOptions<typeof readCustomProductDetailOperation, 'params'>,
) {
  const client = useShopwareQueryClient()
  const queryKey = productKeys.detail(seoUrl, body)

  return queryOptions({
    queryKey,
    queryFn: async () => {
      const opts = unrefOptions(body)
      return client.query(readCustomProductDetailOperation, {
        ...opts,
        params: {
          ...opts.params,
          seoUrl: relativizeSeoUrl(unref(seoUrl)),
        },
      })
    },
  })
}

export function useReadCustomProductDetailQuery(
  seoUrl: MaybeRef<string>,
  body?: OperationOptions<typeof readCustomProductDetailOperation, 'params'>,
) {
  return useQuery(useReadCustomProductDetailOptions(seoUrl, body))
}
