import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys, contextKeys, customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
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
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options?: OperationOptions<typeof deleteCustomerOperation>) => {
      return client.query(deleteCustomerOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.resetQueries({ queryKey: customerKeys.all() }),
        queryClient.resetQueries({ queryKey: contextKeys.all() }),
        queryClient.resetQueries({ queryKey: cartKeys.get() }),
      ])

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
