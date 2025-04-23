import { queryOptions } from '@tanstack/vue-query'
import { useShopwareQueryClient } from './inject'
import { CreateQueryOptions } from './types/query'

const productKeys = {
  all: ['product'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
}

export default function useProducts<Operations>(
  seoUrl: string,
  opts?: CreateQueryOptions<unknown, Error, unknown, ReturnType<typeof productKeys.lists>>,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryKey = productKeys.lists()

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query('readCompactProductListing post /novu/headless/product-listing/{seoUrl}', {
        params: { seoUrl: seoUrl.replace(/^\//, '') },
      })
    },
    ...opts,
  })
}
