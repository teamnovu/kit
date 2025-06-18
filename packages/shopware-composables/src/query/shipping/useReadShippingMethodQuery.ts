import { queryOptions, useQuery } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../../inject'
import { shippingKeys } from '../../keys'
import type { OperationKey, OperationOptions } from '../types/query'
import { unrefOptions } from '../../util/unrefOptions'
import { computed } from 'vue'

export const readShippingMethodOperation = 'readShippingMethod post /shipping-method' satisfies OperationKey

export function useReadShippingMethodQueryOptions(
  options?: OperationOptions<typeof readShippingMethodOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = shippingKeys.list(computed(() => unrefOptions(options)?.body))

  return queryOptions({
    queryKey,
    queryFn: () => client.query(readShippingMethodOperation, unrefOptions(options)),
  })
}

export function useReadShippingMethodQuery(
  options?: OperationOptions<typeof readShippingMethodOperation>,
) {
  return useQuery(useReadShippingMethodQueryOptions(options))
}
