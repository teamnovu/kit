import type { UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { toValue, unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { unrefOptions } from '../../util/unrefOptions'
import { useShopwareMutation } from '../../util/useShopwareQuery'
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

  return useShopwareMutation({
    ...unref(toValue(mutationOptions)),
    mutationFn: async (options: OperationOptions<typeof recoveryPasswordOperation>) => {
      return client.query(recoveryPasswordOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, ...rest) => {
      await unref(unref(toValue(mutationOptions))?.onSuccess)?.(data, variables, ...rest)
    },
  })
}
