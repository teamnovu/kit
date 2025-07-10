import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'
import { unref } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { addressKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'

const deleteCustomerAddressOperation = 'deleteCustomerAddress delete /account/address/{addressId}' satisfies OperationKey

export function useDeleteCustomerAddressMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof deleteCustomerAddressOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof deleteCustomerAddressOperation>
  >,
) {
  const client = useShopwareQueryClient()
  const queryClient = useQueryClient()

  return useMutation({
    ...mutationOptions,
    mutationFn: async (options: OperationOptions<typeof deleteCustomerAddressOperation>) => {
      return client.query(deleteCustomerAddressOperation, unrefOptions(options))
    },
    onSuccess: async (data, variables, context) => {
      // Invalidate address list queries to refetch data
      await queryClient.invalidateQueries({ queryKey: addressKeys.lists() })

      await unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
