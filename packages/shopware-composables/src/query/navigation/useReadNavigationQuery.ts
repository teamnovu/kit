import { shopwareQueryOptions } from '../../util/shopwareQueryOptions'
import { unref, type MaybeRef } from 'vue'
import { useShopwareQueryClient } from '../../inject'
import { useShopwareQuery } from '../../util/useShopwareQuery'
import { navigationKeys } from '../../keys'
import { unrefOptions } from '../../util/unrefOptions'
import type { OperationKey, OperationOptions } from '../types/query'

const readNavigationOperation = 'readNavigation post /navigation/{activeId}/{rootId}' satisfies OperationKey

export const useReadNavigationQueryOptions = function useReadNavigationQueryOptions(
  activeId: MaybeRef<string>,
  rootId: MaybeRef<string>,
  options?: OperationOptions<typeof readNavigationOperation>,
) {
  const client = useShopwareQueryClient()
  const queryKey = navigationKeys.detail(activeId, rootId, options)

  return shopwareQueryOptions({
    queryKey,
    queryFn: async ({ signal }) => {
      const unrefdActiveId = unref(activeId)
      const unrefdRootId = unref(rootId)
      const unrefedOptions = unrefOptions(options)

      return client.query(readNavigationOperation, {
        ...unrefedOptions,
        params: {
          activeId: unrefdActiveId,
          rootId: unrefdRootId,
        },
        signal,
      })
    },
  })
}

export function useReadNavigationQuery(
  activeId: MaybeRef<string>,
  rootId: MaybeRef<string>,
  options?: OperationOptions<typeof readNavigationOperation>,
) {
  return useShopwareQuery(useReadNavigationQueryOptions(activeId, rootId, options))
}
