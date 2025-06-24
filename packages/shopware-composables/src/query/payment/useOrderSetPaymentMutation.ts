import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { orderKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'

const orderSetPaymentOperation = 'orderSetPayment post /order/payment' satisfies OperationKey

export function useOrderSetPaymentMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof orderSetPaymentOperation>,
    unknown,
    OperationOptions<typeof orderSetPaymentOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof orderSetPaymentOperation>) => {
      return client.query(orderSetPaymentOperation, unrefOptions(options))
    },
    onSuccess: (data, variables, context) => {
      // Invalidate order queries to refetch updated payment information
      queryClient.invalidateQueries({ queryKey: orderKeys.all() })

      unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
