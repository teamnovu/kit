import { operations } from '#store-types'
import { queryOptions } from '@tanstack/vue-query'
import { MaybeRef, unref } from 'vue'
import { useShopwareQueryClient } from '../inject'
import { productKeys } from '../keys'
import { OperationBody, OperationKey } from '../types/query'
import { cleanSeoUrl } from '../util/url'

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
        params: { seoUrl: cleanSeoUrl(unref(seoUrl)) },
        body: unref(body),
      })
    },
  })
}
