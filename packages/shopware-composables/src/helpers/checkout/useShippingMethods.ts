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

  const isSaving = computed(() => contextUpdateMutation.isPending.value)

  const setShippingMethod = async (shippingMethodId: string) => {
    return contextUpdateMutation.mutateAsync({
      shippingMethodId,
    })
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
