import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { cartKeys, contextKeys, customerKeys } from '../../keys'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const loginCustomerOperation = 'loginCustomer post /account/login' satisfies OperationKey

export function useLoginCustomerMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof loginCustomerOperation>,
    ShopwareApiError | Error,
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
    onSuccess: async (newCustomer, variables, context) => {
      await Promise.all([
        queryClient.removeQueries({ queryKey: contextKeys.all() }),
        queryClient.invalidateQueries({ queryKey: cartKeys.get() }),
        queryClient.invalidateQueries({ queryKey: customerKeys.get() }),
      ])

      await unref(unref(mutationOptions)?.onSuccess)?.(newCustomer, variables, context)
    },
  })
}
