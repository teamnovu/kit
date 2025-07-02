import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys } from '../../keys'

const removeCartItemOperation = 'removeLineItem post /checkout/cart/line-item/delete' satisfies OperationKey

export function useRemoveLineItemMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof removeCartItemOperation>,
    unknown,
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
      // queryClient.invalidateQueries({ queryKey: cartKeys.get() })
      await unref(unref(mutationOptions)?.onSuccess)?.(newCart, variables, context)
    },
  })
}
