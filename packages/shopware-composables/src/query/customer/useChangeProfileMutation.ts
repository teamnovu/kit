import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const changeProfileOperation = 'changeProfile post /account/change-profile' satisfies OperationKey

export function useChangeProfileMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof changeProfileOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof changeProfileOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof changeProfileOperation>) => {
      return client.query(changeProfileOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.get() })

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
