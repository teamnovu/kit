import { queryOptions, useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { shippingKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

export const readShippingMethodOperation = 'readShippingMethod post /shipping-method' satisfies OperationKey

export function useReadShippingMethodQueryOptions(
  options?: OperationOptions<typeof readShippingMethodOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = shippingKeys.list(computed(() => unrefOptions(options)?.body))

  return queryOptions({
    queryKey,
    queryFn: ({ signal }) => client.query(readShippingMethodOperation, {
      ...unrefOptions(options),
      signal,
    }),
  })
}

export function useReadShippingMethodQuery(
  options?: OperationOptions<typeof readShippingMethodOperation>,
) {
  return useQuery(useReadShippingMethodQueryOptions(options))
}
