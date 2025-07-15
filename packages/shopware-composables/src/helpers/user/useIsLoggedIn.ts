import { computed, type MaybeRef, unref } from 'vue'
import type { Schemas } from '../../query/types/operations'

export function useIsLoggedIn(context: MaybeRef<Schemas['SalesChannelContext'] | undefined>) {
  return computed(() => !!unref(context)?.customer?.id
    && !!unref(context)?.customer?.active
    && !unref(context)?.customer?.guest)
}
