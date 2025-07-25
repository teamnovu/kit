import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys, contextKeys, customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'

const logoutOperation = 'logoutCustomer post /account/logout' satisfies OperationKey

export function useLogoutCustomerMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof logoutOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof logoutOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options?: OperationOptions<typeof logoutOperation>) => {
      return client.query(logoutOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.removeQueries({ queryKey: contextKeys.all() }),
        queryClient.invalidateQueries({ queryKey: cartKeys.get() }),
        queryClient.invalidateQueries({ queryKey: customerKeys.all() }),
      ])

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
