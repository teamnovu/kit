import type { UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { toValue, unref } from 'vue'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { cartKeys, contextKeys, customerKeys } from '../../keys'
import { useShopwareMutation } from '../../util/useShopwareQuery'
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
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
    ...unref(toValue(mutationOptions)),
    mutationFn: async (body: OperationBody<typeof loginCustomerOperation>) => {
      const response = await client.queryRaw(loginCustomerOperation, {
        body,
      })

      const contextToken = response.headers.get('sw-context-token')

      if (contextToken) {
        client.contextToken = contextToken
      }

      return response.json()
    },
    onSuccess: async (newCustomer, variables, ...rest) => {
      await Promise.all([
        queryClient.resetQueries({ queryKey: contextKeys.all() }),
        queryClient.invalidateQueries({ queryKey: cartKeys.get() }),
        queryClient.invalidateQueries({ queryKey: customerKeys.all() }),
      ])

      await unref(unref(toValue(mutationOptions))?.onSuccess)?.(newCustomer, variables, ...rest)
    },
  })
}
