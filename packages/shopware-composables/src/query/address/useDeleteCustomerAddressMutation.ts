import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/vue-query'
import { unref } from 'vue'
import type { OperationKey, OperationOptions, OperationResponse } from '../types/query'
import { useShopwareQueryClient } from '../../inject'
import { addressKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'

const deleteCustomerAddressOperation = 'deleteCustomerAddress delete /account/address/{addressId}' satisfies OperationKey

export function useDeleteCustomerAddressMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof deleteCustomerAddressOperation>,
    unknown,
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
    onSuccess: (data, variables, context) => {
      // Invalidate address list queries to refetch data
      queryClient.invalidateQueries({ queryKey: addressKeys.lists() })

      unref(unref(mutationOptions)?.onSuccess)?.(data, variables, context)
    },
  })
}
