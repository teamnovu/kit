import type { operations } from '#store-types'
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { useShopwareQueryClient } from '../inject'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'
import { contextKeys } from '../keys'
import { unref } from 'vue'

const updateContextOperation = 'updateContext patch /context' satisfies OperationKey

export function useContextUpdate<Operations extends operations>(
  mutationOptions?: UseMutationOptions<
    OperationResponse<Operations, typeof updateContextOperation>,
    unknown,
    OperationBody<Operations, typeof updateContextOperation>
  >,
) {
  const client = useShopwareQueryClient<Operations>()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: OperationBody<Operations, typeof updateContextOperation>) => {
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
