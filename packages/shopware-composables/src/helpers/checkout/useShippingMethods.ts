import { until } from '@vueuse/core'
import { computed } from 'vue'
import { useReadShippingMethodQuery } from '../../query'
import { useReadContextQuery } from '../../query/context/useReadContextQuery'
import { useUpdateContextMutation } from '../../query/context/useUpdateContextMutation'

export function useShippingMethods() {
  const contextQuery = useReadContextQuery()
  const contextUpdateMutation = useUpdateContextMutation()
  const shippingMethodsQuery = useReadShippingMethodQuery({
    query: {
      onlyActive: true,
    },
  })

  const isSaving = computed(() => contextQuery.isFetching || contextUpdateMutation.isPending)

  const setShippingMethod = async (shippingMethodId: string) => {
    await contextUpdateMutation.mutateAsync({
      shippingMethodId,
    })

    await until(isSaving).toBe(false)
  }

  const activeShippingMethod = computed(() => contextQuery.data?.value?.shippingMethod)
  const shippingMethods = computed(() => shippingMethodsQuery.data?.value?.elements)

  return {
    contextUpdateMutation,
    contextQuery,
    shippingMethodsQuery,
    activeShippingMethod,
    setShippingMethod,
    isSaving,
    shippingMethods,
  }
}
