import { queryOptions, useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { paymentKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

export const readPaymentMethodOperation = 'readPaymentMethod post /payment-method' satisfies OperationKey

export function useReadPaymentMethodQueryOptions(
  options?: OperationOptions<typeof readPaymentMethodOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = paymentKeys.list(computed(() => unrefOptions(options)?.body))

  return queryOptions({
    queryKey,
    queryFn: ({ signal }) =>
      client.query(readPaymentMethodOperation, {
        ...unrefOptions(options),
        signal,
      }),
  })
}

export function useReadPaymentMethodQuery(
  options?: OperationOptions<typeof readPaymentMethodOperation>,
) {
  return useQuery(useReadPaymentMethodQueryOptions(options))
}
