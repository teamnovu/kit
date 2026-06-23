import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from "@tanstack/vue-query";
import { ShopwareApiError } from "@teamnovu/kit-shopware-api-client";
import { unref } from "vue";
import { useShopwareQueryClient } from "../../inject";
import { addressKeys, contextKeys } from "../../keys";
import { unrefOptions } from "../../util/unrefOptions";
import type {
  OperationKey,
  OperationOptions,
  OperationResponse,
} from "../types/query";

const createCustomerAddressOperation =
  "createCustomerAddress post /account/address" satisfies OperationKey;

export function useCreateCustomerAddressMutation(
  mutationOptions?: UseMutationOptions<
    OperationResponse<typeof createCustomerAddressOperation>,
    ShopwareApiError | Error,
    OperationOptions<typeof createCustomerAddressOperation>
  >,
) {
  const client = useShopwareQueryClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationOptions,
    mutationFn: async (
      options: OperationOptions<typeof createCustomerAddressOperation>,
    ) => {
      return client.query(
        createCustomerAddressOperation,
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
