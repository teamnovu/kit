import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { contextKeys } from '../../keys'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const updateContextOperation = 'updateContext patch /context' satisfies OperationKey

export function useUpdateContextMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof updateContextOperation>,
    unknown,
    OperationBody<typeof updateContextOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: OperationBody<typeof updateContextOperation>) => {
      return client.query(updateContextOperation, {
        body,
      })
    },

    onSuccess: (newContext, variables, context) => {
      queryClient.invalidateQueries({ queryKey: contextKeys.all() })

      unref(unref(mutationOptions)?.onSuccess)?.(newContext, variables, context)
    },
  })
}
