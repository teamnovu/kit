import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys } from '../../keys'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const updateCartItemOperation = 'updateLineItem patch /checkout/cart/line-item' satisfies OperationKey

type LineItem = OperationBody<typeof updateCartItemOperation>['items'][number]

type LineItemPayload =
  Partial<Omit<LineItem, 'id' | 'quantity' | 'type'>> &
  Required<Pick<LineItem, 'id' | 'quantity' | 'type'>>

type Body = Omit<
  OperationBody<typeof updateCartItemOperation>,
  'items'
> & {
  items: LineItemPayload[]
}

export function useUpdateLineItemMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof updateCartItemOperation>,
    ShopwareApiError | Error,
    Body
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: Body) => {
      return client.query(updateCartItemOperation, {
        body: body as OperationBody<typeof updateCartItemOperation>,
      })
    },
    onSuccess: async (newCart, variables, context) => {
      queryClient.setQueryData(cartKeys.get(), newCart)
      // queryClient.invalidateQueries({ queryKey: cartKeys.get() })
      await unref(unref(mutationOptions)?.onSuccess)?.(newCart, variables, context)
    },
  })
}
