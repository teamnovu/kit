import type { Schemas } from '#store-types'
import { until } from '@vueuse/core'
import { computed } from 'vue'
import { useListAddressQuery } from '../../query/address/useListAddressQuery'
import { useReadContextQuery } from '../../query/context/useReadContextQuery'
import { useUpdateContextMutation } from '../../query/context/useUpdateContextMutation'

export function useCheckoutAddresses() {
  const contextUpdateMutation = useUpdateContextMutation()

  const contextQuery = useReadContextQuery()
  const addressListQuery = useListAddressQuery()

  const isSaving = computed(() => contextQuery.isFetching.value || contextUpdateMutation.isPending.value)

  const setBillingAddress = async (address: Schemas['CustomerAddress']) => {
    await contextUpdateMutation.mutateAsync({
      billingAddressId: address.id,
    })

    await until(isSaving).toBe(false)
  }

  const setShippingAddress = async (address: Schemas['CustomerAddress']) => {
    await contextUpdateMutation.mutateAsync({
      shippingAddressId: address.id,
    })

    await until(isSaving).toBe(false)
  }

  const activeBillingAddress = computed(() => contextQuery.data.value?.customer?.activeBillingAddress)
  const activeShippingAddress = computed(() => contextQuery.data.value?.customer?.activeShippingAddress)

  const inactiveBillingAddresses = computed(() =>
    addressListQuery.data.value?.elements.filter(
      address => address.id !== activeBillingAddress.value?.id,
    ) ?? [])

  const inactiveShippingAddresses = computed(() =>
    addressListQuery.data.value?.elements.filter(
      address => address.id !== activeShippingAddress.value?.id,
    ) ?? [])

  return {
    contextUpdateMutation,
    contextQuery,
    addressListQuery,
    setBillingAddress,
    setShippingAddress,
    isSaving,
    activeBillingAddress,
    activeShippingAddress,
    inactiveBillingAddresses,
    inactiveShippingAddresses,
  }
}
