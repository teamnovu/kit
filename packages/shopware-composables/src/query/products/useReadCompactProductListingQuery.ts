import { queryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from 'vue'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { productKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import { relativizeSeoUrl } from '../../util/url'
import type { OperationKey, OperationOptions } from '../types/query'

// eslint-disable-next-line @stylistic/max-len
const readListingOperation = 'readCompactProductListing post /novu/headless/product-listing/{seoUrl}' satisfies OperationKey

export function useReadCompactProductListingQueryOptions(
  seoUrl: MaybeRef<string>,
  options?: OperationOptions<typeof readListingOperation, 'params'>,
) {
  const client = useShopwareQueryClient()
  const queryKey = productKeys.list(seoUrl, options)

  return queryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const opts = unrefOptions(options)
      return client.query(readListingOperation, {
        ...opts,
        params: {
          ...opts.params,
          seoUrl: relativizeSeoUrl(unref(seoUrl)),
        },
        signal,
      })
    },
  })
}

export function useReadCompactProductListingQuery(
  seoUrl: MaybeRef<string>,
  options?: OperationOptions<typeof readListingOperation, 'params'>,
) {
  return useQuery(useReadCompactProductListingQueryOptions(seoUrl, options))
}
