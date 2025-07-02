import { queryOptions, useQuery } from '@tanstack/vue-query'
import { unref, type MaybeRef } from 'vue'
import { useShopwareQueryClient } from '../../inject'
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

  return queryOptions({
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
  return useQuery(useReadNavigationQueryOptions(activeId, rootId, options))
}
