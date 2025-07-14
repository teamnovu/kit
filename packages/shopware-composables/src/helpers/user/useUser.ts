import { computed } from 'vue'
import {
  useReadCustomerQuery,
} from '../../query/customer'
import type { Schemas } from '../../query/types'

export function useUser(criteria?: Schemas['Criteria']) {
  // Create customer query
  const customerQuery = useReadCustomerQuery(criteria ? { body: criteria } : undefined)

  const user = computed(() => customerQuery.data?.value)

  const isLoggedIn = computed(
    () => !!user.value?.id && !!user.value.active && !user.value.guest,
  )

  const isCustomerSession = computed(
    () => !!user.value?.id && !user.value.guest,
  )

  const isGuestSession = computed(() => !!user.value?.guest)

  const defaultBillingAddressId = computed(
    () => user.value?.defaultBillingAddressId || null,
  )

  const defaultShippingAddressId = computed(
    () => user.value?.defaultShippingAddressId || null,
  )

  const userDefaultBillingAddress = computed(
    () => user.value?.defaultBillingAddress || null,
  )

  const userDefaultShippingAddress = computed(
    () => user.value?.defaultShippingAddress || null,
  )

  return {
    // Computed properties
    user,
    isLoggedIn,
    isCustomerSession,
    isGuestSession,
    defaultBillingAddressId,
    defaultShippingAddressId,
    userDefaultBillingAddress,
    userDefaultShippingAddress,

    // Expose queries and mutations directly
    customerQuery,
  }
}
