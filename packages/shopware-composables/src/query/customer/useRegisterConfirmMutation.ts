import { useMutation, type UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const registerConfirmOperation = 'registerConfirm post /account/register-confirm' satisfies OperationKey

export function useRegisterConfirmMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof registerConfirmOperation>,
    ShopwareApiError | Error,
    OperationBody<typeof registerConfirmOperation>
  >,
) {
  const client = useShopwareQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: OperationBody<typeof registerConfirmOperation>) => {
      const response = await client.queryRaw(registerConfirmOperation, {
        body,
      })

      const contextToken = response.headers.get('sw-context-token')

      if (contextToken) {
        client.contextToken = contextToken
      }

      return response.json() as Promise<never>
    },
    onSuccess: async (newCustomer, variables, context) => {
      await unref(unref(mutationOptions)?.onSuccess)?.(newCustomer, variables, context)
    },
  })
}
