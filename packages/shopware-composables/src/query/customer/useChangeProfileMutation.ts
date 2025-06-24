import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'

const changeProfileOperation = 'changeProfile post /account/change-profile' satisfies OperationKey

export function useChangeProfileMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof changeProfileOperation>,
    unknown,
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
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.get() })

      unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}

