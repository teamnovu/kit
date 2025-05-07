import { operations } from '#store-types'
import { queryOptions } from '@tanstack/vue-query'
import { MaybeRef, unref } from 'vue'
import { useShopwareQueryClient } from '../inject'
import { productKeys } from '../keys'
import { OperationBody, OperationKey } from '../types/query'
import { cleanSeoUrl } from '../util/url'

const readCustomProductDetailOperation = 'readCustomProductDetail post /novu/headless/product/{seoUrl}' satisfies OperationKey

export function useProductQueryOptions<Operations extends operations>(
  seoUrl: MaybeRef<string>,
  body?: MaybeRef<OperationBody<Operations, typeof readCustomProductDetailOperation>>,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryKey = productKeys.detail(seoUrl, body)

  return queryOptions({
    queryKey,
    queryFn: async () => {
      return client.query(readCustomProductDetailOperation, {
        params: { seoUrl: cleanSeoUrl(unref(seoUrl)) },
        body: unref(body),
      })
    },
  })
}
