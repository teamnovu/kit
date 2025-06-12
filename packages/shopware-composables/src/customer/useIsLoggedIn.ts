import { operations } from '#store-types'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useContextOptions } from '../context/useContextOptions'

export default function useIsLoggedIn<Operations extends operations>() {
  const contextOptions = useContextOptions<Operations>()

  const { data: context } = useQuery(contextOptions)

  return computed(() => !!context.value?.customer?.id
    && !!context.value?.customer?.active
    && !context.value?.customer?.guest)
}
