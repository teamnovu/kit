import { useMutation, type UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const sendRecoveryMailOperation = 'sendRecoveryMail post /account/recovery-password' satisfies OperationKey

export function useSendRecoveryMailMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof sendRecoveryMailOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof sendRecoveryMailOperation>
  >,
) {
  const client = useShopwareQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof sendRecoveryMailOperation>) => {
      return client.query(sendRecoveryMailOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
