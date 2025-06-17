import { queryOptions } from '@tanstack/vue-query'
import { MaybeRef } from 'vue'
import { useShopwareQueryClient } from '../inject'
import { shippingKeys } from '../keys'
import type { OperationBody, OperationKey } from '../types/query'
import { operations } from '#store-types'

const readShippingMethodOperation = 'readShippingMethod post /shipping-method' satisfies OperationKey

export function useReadShippingMethodsQueryOptions<Operations extends operations>(
  body?: MaybeRef<OperationBody<Operations, typeof readShippingMethodOperation>>,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryKey = shippingKeys.list(body)

  return queryOptions({
    queryKey,
    queryFn: () => client.query(readShippingMethodOperation, {
      body,
    }),
  })
}
