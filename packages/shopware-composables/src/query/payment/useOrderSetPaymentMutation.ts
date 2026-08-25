import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import type { UseMutationOptions } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { orderKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import { useShopwareMutation } from '../../util/useShopwareQuery'

const orderSetPaymentOperation = 'orderSetPayment post /order/payment' satisfies OperationKey

export function useOrderSetPaymentMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof orderSetPaymentOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof orderSetPaymentOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof orderSetPaymentOperation>) => {
      return client.query(orderSetPaymentOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      // Invalidate order queries to refetch updated payment information
      await queryClient.invalidateQueries({ queryKey: orderKeys.all() })

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
