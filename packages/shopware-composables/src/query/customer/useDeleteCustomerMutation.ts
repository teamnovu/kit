import type { UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { toValue, unref } from 'vue'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { cartKeys, contextKeys, customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import { useShopwareMutation } from '../../util/useShopwareQuery'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const deleteCustomerOperation = 'deleteCustomer delete /account/customer' satisfies OperationKey

export function useDeleteCustomerMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof deleteCustomerOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof deleteCustomerOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
    ...unref(toValue(mutationOptions)),
    mutationFn: async (options: OperationOptions<typeof deleteCustomerOperation>) => {
      return client.query(deleteCustomerOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, ...rest) => {
      await Promise.all([
        queryClient.resetQueries({ queryKey: customerKeys.all() }),
        queryClient.resetQueries({ queryKey: contextKeys.all() }),
        queryClient.resetQueries({ queryKey: cartKeys.get() }),
      ])

      await unref(unref(toValue(mutationOptions))?.onSuccess)?.(data, variables, ...rest)
    },
  })
}
