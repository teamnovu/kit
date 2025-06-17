import { operations } from '#store-types'
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../inject'
import { cartKeys } from '../keys'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const removeCartItemOperation = 'removeLineItem post /checkout/cart/line-item/delete' satisfies OperationKey

export function useCartRemoveItemMutation<Operations extends operations>(
  mutationOptions?: UseMutationOptions<
    OperationResponse<Operations, typeof removeCartItemOperation>,
    unknown,
    OperationBody<Operations, typeof removeCartItemOperation>
  >,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: OperationBody<Operations, typeof removeCartItemOperation>) => {
      return client.query(removeCartItemOperation, {
        body: body as OperationBody<Operations, typeof removeCartItemOperation>,
      })
    },
    onSuccess: (newCart, variables, context) => {
      queryClient.setQueryData(cartKeys.get(), newCart)
      // queryClient.invalidateQueries({ queryKey: cartKeys.get() })
      unref(unref(mutationOptions)?.onSuccess)?.(newCart, variables, context)
    },
  })
}
