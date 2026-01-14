import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys, paymentKeys } from '../../keys'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const removeCartItemOperation = 'removeLineItem post /checkout/cart/line-item/delete' satisfies OperationKey

export function useRemoveLineItemMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof removeCartItemOperation>,
    ShopwareApiError | Error,
    OperationBody<typeof removeCartItemOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: OperationBody<typeof removeCartItemOperation>) => {
      return client.query(removeCartItemOperation, {
        body: body as OperationBody<typeof removeCartItemOperation>,
      })
    },
    onSuccess: async (newCart, variables, context) => {
      queryClient.setQueryData(cartKeys.get(), newCart)
      await queryClient.invalidateQueries({ queryKey: paymentKeys.lists() })
      // queryClient.invalidateQueries({ queryKey: cartKeys.get() })
      await unref(unref(mutationOptions)?.onSuccess)?.(newCart, variables, context)
    },
  })
}
