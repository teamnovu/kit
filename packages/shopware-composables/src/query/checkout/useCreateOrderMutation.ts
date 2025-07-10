import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys, orderKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'

const createOrderOperation = 'createOrder post /checkout/order' satisfies OperationKey

export function useCreateOrderMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof createOrderOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof createOrderOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options?: OperationOptions<typeof createOrderOperation>) => {
      return client.query(createOrderOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        // Clear cart after successful order creation
        queryClient.invalidateQueries({ queryKey: cartKeys.get() }),

        // Invalidate order list to refetch data
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
      ])

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
