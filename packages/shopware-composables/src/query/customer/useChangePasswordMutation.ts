import { useMutation, type UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const changePasswordOperation = 'changePassword post /account/change-password' satisfies OperationKey

export function useChangePasswordMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof changePasswordOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof changePasswordOperation>
  >,
) {
  const client = useShopwareQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof changePasswordOperation>) => {
      return client.query(changePasswordOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
