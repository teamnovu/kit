import { computed } from 'vue'
import { useReadPaymentMethodQuery } from '../../query'
import { useReadContextQuery } from '../../query/context/useReadContextQuery'
import { useUpdateContextMutation } from '../../query/context/useUpdateContextMutation'

export function usePaymentMethods() {
  const contextQuery = useReadContextQuery()
  const contextUpdateMutation = useUpdateContextMutation()
  const paymentMethodsQuery = useReadPaymentMethodQuery({
    query: {
      onlyActive: true,
    },
  })

  const isSaving = computed(() => contextUpdateMutation.isPending.value)

  const setPaymentMethod = async (paymentMethodId: string) => {
    return contextUpdateMutation.mutateAsync({
      paymentMethodId,
    })
  }

  const activePaymentMethod = computed(() => contextQuery.data?.value?.paymentMethod)
  const paymentMethods = computed(() =>
    paymentMethodsQuery.data?.value?.elements?.sort((a, b) => {
      return (a.position ?? 0) - (b.position ?? 0)
    }) ?? [])

  return {
    contextUpdateMutation,
    contextQuery,
    paymentMethodsQuery,
    activePaymentMethod,
    setPaymentMethod,
    isSaving,
    paymentMethods,
  }
}
