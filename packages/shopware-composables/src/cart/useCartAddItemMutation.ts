import { operations } from '#store-types'
import { MutationOptions, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../inject'
import { cartKeys } from '../keys'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const addCartItemOperation = 'addLineItem post /checkout/cart/line-item' satisfies OperationKey

type LineItem<Operations extends operations> = OperationBody<
  Operations,
  typeof addCartItemOperation
>['items'][number]

type LineItemPayload<Operations extends operations> =
  Partial<Omit<LineItem<Operations>, 'id' | 'quantity' | 'type'>> &
  Required<Pick<LineItem<Operations>, 'id' | 'quantity' | 'type'>>

type Body<Operations extends operations> = Omit<
  OperationBody<Operations, typeof addCartItemOperation>,
  'items'
> & {
  items: LineItemPayload<Operations>[]
}

export function useCartAddItemMutation<Operations extends operations>(
  mutationOptions: MutationOptions<
    OperationResponse<Operations, typeof addCartItemOperation>,
    unknown,
    Body<Operations>
  >,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: Body<Operations>) => {
      return client.query(addCartItemOperation, {
        body: body as OperationBody<Operations, typeof addCartItemOperation>,
      })
    },
    onSuccess: (newCart, variables, context) => {
      queryClient.setQueryData(cartKeys.get(), newCart)
      // queryClient.invalidateQueries({ queryKey: cartKeys.get() })
      mutationOptions.onSuccess?.(newCart, variables, context)
    },
  })
}
