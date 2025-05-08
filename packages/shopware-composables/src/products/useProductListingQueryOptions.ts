import type { operations } from '#store-types'
import { queryOptions } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../inject'
import { productKeys } from '../keys'
import type { OperationBody, OperationKey } from '../types/query'
import { relativizeSeoUrl } from '../util/url'

const readListingOperation = 'readCompactProductListing post /novu/headless/product-listing/{seoUrl}' satisfies OperationKey

export function useProductListingQueryOptions<Operations extends operations>(
  seoUrl: MaybeRef<string>,
  body?: MaybeRef<OperationBody<Operations, typeof readListingOperation>>,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryKey = productKeys.list(seoUrl, body)

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query(readListingOperation, {
        params: { seoUrl: relativizeSeoUrl(unref(seoUrl)) },
        body: unref(body),
      })
    },
  })
}
