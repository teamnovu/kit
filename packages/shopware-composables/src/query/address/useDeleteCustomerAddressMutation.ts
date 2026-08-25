import type { UseMutationOptions } from "@tanstack/vue-query";
import { ShopwareApiError } from "@teamnovu/kit-shopware-api-client";
import { unref } from "vue";
import { useShopwareQueryClient, useShopwareVueQueryClient } from "../../inject";
import { addressKeys, contextKeys } from "../../keys";
import { unrefOptions } from "../../util/unrefOptions";
import { useShopwareMutation } from "../../util/useShopwareQuery";
import type {
  OperationKey,
  OperationOptions,
  OperationResponse,
} from "../types/query";

const deleteCustomerAddressOperation =
  "deleteCustomerAddress delete /account/address/{addressId}" satisfies OperationKey;

export function useDeleteCustomerAddressMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof deleteCustomerAddressOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof deleteCustomerAddressOperation>
  >,
) {
  const client = useShopwareQueryClient();
  const queryClient = useShopwareVueQueryClient();

  return useShopwareMutation({
    ...mutationOptions,
    mutationFn: async (
      options: OperationOptions<typeof deleteCustomerAddressOperation>,
    ) => {
      return client.query(
        deleteCustomerAddressOperation,
        unrefOptions(options),
      );
    },
    onSuccess: async (data, variables, context) => {
      // Invalidate address list queries to refetch data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: addressKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: contextKeys.all() }),
      ]);

      await unref(unref(mutationOptions)?.onSuccess)?.(
        data,
        variables,
        context,
      );
    },
  });
}
