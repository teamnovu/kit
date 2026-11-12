import type { UseMutationOptions } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { toValue, unref } from 'vue'
import { useShopwareQueryClient, useShopwareVueQueryClient } from '../../inject'
import { contextKeys, customerKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import { useShopwareMutation } from '../../util/useShopwareQuery'
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
  const queryClient = useShopwareVueQueryClient()

  return useShopwareMutation({
    ...unref(toValue(mutationOptions)),
    mutationFn: async (options: OperationOptions<typeof registerOperation>) => {
      return client.query(registerOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, ...rest) => {
      await Promise.all([
        queryClient.resetQueries({ queryKey: contextKeys.all() }),
        queryClient.invalidateQueries({ queryKey: customerKeys.all() }),
      ])

      await unref(unref(toValue(mutationOptions))?.onSuccess)?.(data, variables, ...rest)
    },
  })
}
