import { queryOptions } from '@tanstack/vue-query'
import { useShopwareQueryClient } from './inject'

const productKeys = {
  all: ['product'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
}

export default function useProducts<Operations>() {
  const client = useShopwareQueryClient<Operations>()

  return queryOptions({
    queryKey: productKeys.lists(),
    queryFn: async () => {
      return client.query('/novu/headless/product-listing/{seoUrl}', {
        method: 'post',
        params: {
          seoUrl: 'Food/Bakery-products/',
        },
      })
    },
  })
}
