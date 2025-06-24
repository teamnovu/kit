import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'

const logoutOperation = 'logoutCustomer post /account/logout' satisfies OperationKey

export function useLogoutCustomerMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof logoutOperation>,
    unknown,
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
    onSuccess: (data, variables, context) => {
      queryClient.removeQueries({ queryKey: customerKeys.get() })

      unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}

