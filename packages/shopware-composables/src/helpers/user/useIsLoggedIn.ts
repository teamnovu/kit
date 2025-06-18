import { computed } from 'vue'
import { useReadContextQuery } from '../../query/context/useReadContextQuery'

export default function useIsLoggedIn() {
  const { data: context } = useReadContextQuery()

  return computed(() => !!context.value?.customer?.id
    && !!context.value?.customer?.active
    && !context.value?.customer?.guest)
}
