import type { UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { toValue, unref } from 'vue'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { cartKeys, contextKeys, paymentKeys, shippingKeys } from '../../keys'
import { useShopwareMutation } from '../../util/useShopwareQuery'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const updateContextOperation = 'updateContext patch /context' satisfies OperationKey

export function useUpdateContextMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof updateContextOperation>,
    ShopwareApiError | Error,
    OperationBody<typeof updateContextOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
    ...unref(toValue(mutationOptions)),
    mutationFn: async (body: OperationBody<typeof updateContextOperation>) => {
      // Prevent race condition by cancelling the query before the mutation is executed
      queryClient.cancelQueries({ queryKey: contextKeys.all() })

      return client.query(updateContextOperation, {
        body,
      })
    },

    onSuccess: async (newContext, variables, ...rest) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: contextKeys.all() }),
        queryClient.invalidateQueries({ queryKey: cartKeys.get() }),
        queryClient.invalidateQueries({ queryKey: paymentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: shippingKeys.lists() }),
      ])

      await unref(unref(toValue(mutationOptions))?.onSuccess)?.(newContext, variables, ...rest)
    },
  })
}
