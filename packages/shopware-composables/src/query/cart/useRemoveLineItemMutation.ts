import type { UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { toValue, unref } from 'vue'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { cartKeys, paymentKeys, shippingKeys } from '../../keys'
import { useShopwareMutation } from '../../util/useShopwareQuery'
import type {
  OperationBody,
  OperationKey,
  OperationResponse,
} from '../types/query'

const removeCartItemOperation = 'removeLineItem post /checkout/cart/line-item/delete' satisfies OperationKey

export function useRemoveLineItemMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof removeCartItemOperation>,
    ShopwareApiError | Error,
    OperationBody<typeof removeCartItemOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
    ...unref(toValue(mutationOptions)),
    mutationFn: async (body: OperationBody<typeof removeCartItemOperation>) => {
      return client.query(removeCartItemOperation, {
        body: body as OperationBody<typeof removeCartItemOperation>,
      })
    },
    onSuccess: async (newCart, variables, ...rest) => {
      queryClient.setQueryData(cartKeys.get(), newCart)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: paymentKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: shippingKeys.lists() }),
      ])
      // queryClient.invalidateQueries({ queryKey: cartKeys.get() })
      await unref(unref(toValue(mutationOptions))?.onSuccess)?.(
        newCart,
        variables,
        ...rest,
      )
    },
  })
}
