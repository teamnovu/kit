import type { UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { cartKeys, contextKeys, orderKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import { useShopwareMutation } from '../../util/useShopwareQuery'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const createOrderOperation = 'createOrder post /checkout/order' satisfies OperationKey

export function useCreateOrderMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof createOrderOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof createOrderOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
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

        // Invalidate context
        queryClient.invalidateQueries({ queryKey: contextKeys.all() })
      ])

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
