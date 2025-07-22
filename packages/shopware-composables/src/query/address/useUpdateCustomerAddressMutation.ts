import { useMutation, type UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { addressKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const updateCustomerAddressOperation = 'updateCustomerAddress patch /account/address/{addressId}' satisfies OperationKey

export function useUpdateCustomerAddressMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof updateCustomerAddressOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof updateCustomerAddressOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof updateCustomerAddressOperation>) => {
      return client.query(updateCustomerAddressOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      const { addressId } = unrefOptions(variables).params
      queryClient.setQueryData(addressKeys.detail(addressId), data)

      // Invalidate address list queries to refetch data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: addressKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: addressKeys.detail(unrefOptions(variables).params.addressId),
          predicate: query => query.queryKey.at(-1) !== addressId,
        }),
      ])

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
