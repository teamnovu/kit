import type { UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { toValue, unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { unrefOptions } from '../../util/unrefOptions'
import { useShopwareMutation } from '../../util/useShopwareQuery'
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

  return useShopwareMutation({
    ...unref(toValue(mutationOptions)),
    mutationFn: async (options: OperationOptions<typeof sendRecoveryMailOperation>) => {
      return client.query(sendRecoveryMailOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, ...rest) => {
      await unref(unref(toValue(mutationOptions))?.onSuccess)?.(data, variables, ...rest)
    },
  })
}
