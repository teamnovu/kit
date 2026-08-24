import { useMutation, type UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { contextKeys, customerKeys } from '../../keys'
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
  const queryClient = useShopwareVueQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof changeProfileOperation>) => {
      return client.query(changeProfileOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerKeys.all() }),
        queryClient.invalidateQueries({ queryKey: contextKeys.all() }),
      ])

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  }, queryClient)
}
