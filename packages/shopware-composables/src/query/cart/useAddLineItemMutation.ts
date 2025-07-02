import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys } from '../../keys'

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
    unknown,
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
