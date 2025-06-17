import { Schemas } from '#store-types'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useContextUpdate } from '../context/useContextUpdate'
import { useContextOptions } from '../context/useContextOptions'
import { useListAddressesQueryOptions } from './useListAddressesQueryOptions'
import { until } from '@vueuse/core'

export function useCheckoutAddresses() {
  const contextOptions = useContextOptions()
  const listAddressesQueryOptions = useListAddressesQueryOptions()

  const contextUpdateMutation = useContextUpdate()

  const contextQuery = useQuery(contextOptions)
  const addressListQuery = useQuery(listAddressesQueryOptions)

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
      address => address.id !== activeBillingAddress.value?.id,
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
