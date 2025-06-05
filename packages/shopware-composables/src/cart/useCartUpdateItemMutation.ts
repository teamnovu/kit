import { operations } from '#store-types'
import { MutationOptions, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../inject'
import { cartKeys } from '../keys'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const updateCartItemOperation = 'updateLineItem patch /checkout/cart/line-item' satisfies OperationKey

type LineItem<Operations extends operations> = OperationBody<
  Operations,
  typeof updateCartItemOperation
>['items'][number]

type LineItemPayload<Operations extends operations> =
  Partial<Omit<LineItem<Operations>, 'id' | 'quantity' | 'type'>> &
  Required<Pick<LineItem<Operations>, 'id' | 'quantity' | 'type'>>

type Body<Operations extends operations> = Omit<
  OperationBody<Operations, typeof updateCartItemOperation>,
  'items'
> & {
  items: LineItemPayload<Operations>[]
}

export function useCartUpdateItemMutation<Operations extends operations>(
  mutationOptions?: MutationOptions<
    OperationResponse<Operations, typeof updateCartItemOperation>,
    unknown,
    Body<Operations>
  >,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: Body<Operations>) => {
      return client.query(updateCartItemOperation, {
        body: body as OperationBody<Operations, typeof updateCartItemOperation>,
      })
    },
    onSuccess: (newCart, variables, context) => {
      queryClient.setQueryData(cartKeys.get(), newCart)
      // queryClient.invalidateQueries({ queryKey: cartKeys.get() })
      mutationOptions?.onSuccess?.(newCart, variables, context)
    },
  })
}
