import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { contextKeys, cartKeys, customerKeys } from '../../keys'

const loginCustomerOperation = 'loginCustomer post /account/login' satisfies OperationKey

export function useLoginCustomerMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof loginCustomerOperation>,
    unknown,
    OperationBody<typeof loginCustomerOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: OperationBody<typeof loginCustomerOperation>) => {
      const response = await client.queryRaw(loginCustomerOperation, {
        body,
      })

      const contextToken = response.headers.get('sw-context-token')

      if (contextToken) {
        client.setContextToken(contextToken)
      }

      return response.json()
    },
    onSuccess: (newCustomer, variables, context) => {
      queryClient.invalidateQueries({ queryKey: contextKeys.all() })
      queryClient.invalidateQueries({ queryKey: cartKeys.get() })
      queryClient.invalidateQueries({ queryKey: customerKeys.get() })

      unref(unref(mutationOptions)?.onSuccess)?.(newCustomer, variables, context)
    },
  })
}
