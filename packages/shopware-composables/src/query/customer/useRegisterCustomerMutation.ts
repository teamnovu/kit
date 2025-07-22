import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const registerOperation = 'register post /account/register' satisfies OperationKey

export function useRegisterCustomerMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof registerOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof registerOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof registerOperation>) => {
      return client.query(registerOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.all() })

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
