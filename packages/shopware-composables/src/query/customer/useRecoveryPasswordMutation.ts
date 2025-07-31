import { useMutation, type UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const recoveryPasswordOperation = 'recoveryPassword post /account/recovery-password-confirm' satisfies OperationKey

export function useRecoveryPasswordMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof recoveryPasswordOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof recoveryPasswordOperation>
  >,
) {
  const client = useShopwareQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof recoveryPasswordOperation>) => {
      return client.query(recoveryPasswordOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
