import { computed, MaybeRef, unref } from 'vue'
import { Schemas } from '#store-types'

export function useIsLoggedIn(context: MaybeRef<Schemas['SalesChannelContext'] | undefined>) {
  return computed(() => !!unref(context)?.customer?.id
    && !!unref(context)?.customer?.active
    && !unref(context)?.customer?.guest)
}
