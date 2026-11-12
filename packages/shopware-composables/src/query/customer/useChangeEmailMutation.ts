import type { UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { toValue, unref } from 'vue'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { contextKeys, customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import { useShopwareMutation } from '../../util/useShopwareQuery'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const changeEmailOperation = 'changeEmail post /account/change-email' satisfies OperationKey

export function useChangeEmailMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof changeEmailOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof changeEmailOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
    ...unref(toValue(mutationOptions)),
    mutationFn: async (options: OperationOptions<typeof changeEmailOperation>) => {
      return client.query(changeEmailOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, ...rest) => {
      await queryClient.invalidateQueries({ queryKey: customerKeys.all() })
      await queryClient.invalidateQueries({ queryKey: contextKeys.all() })

      await unref(unref(toValue(mutationOptions))?.onSuccess)?.(data, variables, ...rest)
    },
  })
}
