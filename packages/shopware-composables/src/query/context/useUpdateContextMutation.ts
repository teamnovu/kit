import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { contextKeys } from '../../keys'
import type { OperationBody, OperationKey, OperationResponse } from '../types/query'

const updateContextOperation = 'updateContext patch /context' satisfies OperationKey

export function useUpdateContextMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof updateContextOperation>,
    ShopwareApiError | Error,
    OperationBody<typeof updateContextOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (body: OperationBody<typeof updateContextOperation>) => {
      // Prevent race condition by cancelling the query before the mutation is executed
      queryClient.cancelQueries({ queryKey: contextKeys.all() })

      return client.query(updateContextOperation, {
        body,
      })
    },

    onSuccess: async (newContext, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: contextKeys.all() })

      await unref(unref(mutationOptions)?.onSuccess)?.(newContext, variables, context)
    },
  })
}
