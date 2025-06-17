import { useQuery } from '@tanstack/vue-query'
import { useContextOptions } from '../context/useContextOptions'
import { useContextUpdate } from '../context/useContextUpdate'
import { useReadCustomerQueryOptions } from '../customer/useReadCustomerQueryOptions'
import { until } from '@vueuse/core'
import { computed } from 'vue'

export function useShippingMethods() {
  const contextOptions = useContextOptions()
  const readShippingMethodQueryOptions = useReadCustomerQueryOptions()

  const contextUpdateMutation = useContextUpdate()

  const contextQuery = useQuery(contextOptions)
  const shippingMethodsQuery = useQuery(readShippingMethodQueryOptions)

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
