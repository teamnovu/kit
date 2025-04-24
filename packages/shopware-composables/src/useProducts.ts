import { useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from './inject'
import { OperationKey, OperationBody, OperationOptions } from './types/query'
import { MaybeRef, unref } from 'vue'
import { operations } from '#store-types'

const productKeys = {
  all: ['product'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: <Body>(body: Body) =>
    [...productKeys.all, 'list', { body }] as const,
}

const readListingOperation = 'readCompactProductListing post /novu/headless/product-listing/{seoUrl}' satisfies OperationKey

export default function useProducts<Operations extends operations>(
  seoUrl: MaybeRef<string>,
  body?: MaybeRef<OperationBody<Operations, typeof readListingOperation>>,
  opts?: MaybeRef<
    OperationOptions<
      Operations,
      typeof readListingOperation,
      ReturnType<typeof productKeys.lists>
    >
  >,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryKey = productKeys.list(body)

  return useQuery({
    // @ts-expect-error - typing error: see https://github.com/TanStack/query/issues/8199
    queryKey,
    queryFn: async () => {
      return client.query(readListingOperation, {
        params: { seoUrl: unref(seoUrl).replace(/^\//, '') },
        body: unref(body),
      })
    },
    ...opts,
  })
}
