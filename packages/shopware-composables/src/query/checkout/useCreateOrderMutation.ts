import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { orderKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
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
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options?: OperationOptions<typeof createOrderOperation>) => {
      return client.query(createOrderOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        // Invalidate order list to refetch data
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
      ])

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
