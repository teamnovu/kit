import { operations } from '#store-types'
import { MutationOptions, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../inject'
import { cartKeys, contextKeys } from '../keys'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const loginCustomerOperation = 'loginCustomer post /account/login' satisfies OperationKey

export function useLoginMutation<Operations extends operations>(
  mutationOptions?: MutationOptions<
    OperationResponse<Operations, typeof loginCustomerOperation>,
    unknown,
    OperationBody<Operations, typeof loginCustomerOperation>
  >,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: OperationBody<Operations, typeof loginCustomerOperation>) => {
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

      mutationOptions?.onSuccess?.(newCustomer, variables, context)
    },
  })
}
