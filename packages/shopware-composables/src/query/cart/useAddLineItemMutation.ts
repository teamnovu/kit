import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys } from '../../keys'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const addCartItemOperation = 'addLineItem post /checkout/cart/line-item' satisfies OperationKey

type LineItem = OperationBody<typeof addCartItemOperation>['items'][number]

type LineItemPayload =
  Partial<Omit<LineItem, 'id' | 'quantity' | 'type'>> &
  Required<Pick<LineItem, 'id' | 'quantity' | 'type'>>

type Body = Omit<
  OperationBody<typeof addCartItemOperation>,
  'items'
> & {
  items: LineItemPayload[]
}

export function useAddLineItemMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof addCartItemOperation>,
    ShopwareApiError | Error,
    Body
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: Body) => {
      return client.query(addCartItemOperation, {
        body: body as OperationBody<typeof addCartItemOperation>,
      })
    },
    onSuccess: async (newCart, variables, context) => {
      queryClient.setQueryData(cartKeys.get(), newCart)
      // queryClient.invalidateQueries({ queryKey: cartKeys.get() })
      await unref(unref(mutationOptions)?.onSuccess)?.(newCart, variables, context)
    },
  })
}
