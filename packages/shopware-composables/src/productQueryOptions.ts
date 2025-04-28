import { operations } from '#store-types'
import { queryOptions } from '@tanstack/vue-query'
import { MaybeRef, unref } from 'vue'
import { useShopwareQueryClient } from './inject'
import { OperationBody, OperationKey } from './types/query'

const productKeys = {
  all: () => ['product'] as const,
  lists: () => [...productKeys.all(), 'list'] as const,
  list: (body: MaybeRef<unknown>) =>
    [...productKeys.all(), 'list', { body }] as const,
}

const readListingOperation = 'readCompactProductListing post /novu/headless/product-listing/{seoUrl}' satisfies OperationKey

export function productQueryOptions<Operations extends operations>(
  seoUrl: MaybeRef<string>,
  body?: MaybeRef<OperationBody<Operations, typeof readListingOperation>>,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryKey = productKeys.list(body)

  const cleanedSeoUrl = unref(seoUrl).replace(/^\//, '')
    .replace(/\/?$/, '/')

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query(readListingOperation, {
        params: { seoUrl: cleanedSeoUrl },
        body: unref(body),
      })
    },
  })
}
