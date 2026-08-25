import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import type { UseMutationOptions } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { addressKeys, cartKeys, contextKeys, customerKeys, orderKeys, paymentKeys, shippingKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import { useShopwareMutation } from '../../util/useShopwareQuery'

const logoutOperation = 'logoutCustomer post /account/logout' satisfies OperationKey

export function useLogoutCustomerMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof logoutOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof logoutOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
    ...mutationOptions,
    mutationFn: async (options?: OperationOptions<typeof logoutOperation>) => {
      return client.query(logoutOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.resetQueries({ queryKey: contextKeys.all() }),
        queryClient.invalidateQueries({ queryKey: cartKeys.get() }),
        queryClient.invalidateQueries({ queryKey: customerKeys.all() }),
        queryClient.invalidateQueries({ queryKey: addressKeys.all() }),
        queryClient.invalidateQueries({ queryKey: shippingKeys.all() }),
        queryClient.invalidateQueries({ queryKey: paymentKeys.all() }),
        queryClient.invalidateQueries({ queryKey: orderKeys.all() }),
      ])

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
