import { until } from '@vueuse/core'
import { computed } from 'vue'
import { useReadContextQuery } from '../../query/context/useReadContextQuery'
import { useReadCustomerQuery } from '../../query/customer/useReadCustomerQuery'
import { useUpdateContextMutation } from '../../query/context/useUpdateContextMutation'

export function useShippingMethods() {
  const contextQuery = useReadContextQuery()
  const shippingMethodsQuery = useReadCustomerQuery()
  const contextUpdateMutation = useUpdateContextMutation()

  const isSaving = computed(() => contextQuery.isFetching || contextUpdateMutation.isPending)

  const setShippingMethod = async (shippingMethodId: string) => {
    await contextUpdateMutation.mutateAsync({
      shippingMethodId,
    })

    await until(isSaving).toBe(false)
  }

  const activeShippingMethod = computed(() => contextQuery.data?.value?.shippingMethod)

  return {
    contextUpdateMutation,
    contextQuery,
    shippingMethodsQuery,
    activeShippingMethod,
    setShippingMethod,
  }
}
