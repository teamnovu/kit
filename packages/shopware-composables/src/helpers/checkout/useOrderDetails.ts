import type { MaybeRef } from 'vue'
import { computed, unref } from 'vue'
import { useReadOrderQuery } from '../../query/order'
import { Schemas } from '../../query/types'

export function useOrderDetails(
  orderId: MaybeRef<string>,
  criteria?: Schemas['Criteria'],
) {
  // Create reactive order query options
  const orderQueryOptions = computed(() => {
    const id = unref(orderId)
    if (!id) return undefined

    return {
      body: {
        filter: [
          {
            type: 'equals',
            field: 'id',
            value: id,
          },
        ],
        ...criteria,
        checkPromotion: true,
      } as Schemas['Criteria'],
    }
  })

  // Create order query
  const orderQuery = useReadOrderQuery(orderQueryOptions.value)

  // Computed properties based on order data
  const order = computed(() => orderQuery.data?.value?.orders?.elements?.[0])

  const paymentChangeableList = computed(() => {
    return orderQuery.data?.value?.paymentChangeable || {}
  })

  const status = computed(() => order.value?.stateMachineState?.translated?.name)
  const statusTechnicalName = computed(() => order.value?.stateMachineState?.technicalName)
  const total = computed(() => order.value?.price?.totalPrice)
  const subtotal = computed(() => order.value?.price?.positionPrice)
  const shippingCosts = computed(() => order.value?.shippingTotal)

  const personalDetails = computed(() => ({
    email: order.value?.orderCustomer?.email,
    firstName: order.value?.orderCustomer?.firstName,
    lastName: order.value?.orderCustomer?.lastName,
  }))

  const billingAddress = computed(() =>
    order.value?.addresses?.find(
      ({ id }: { id: string }) => id === order.value?.billingAddressId,
    ))

  const shippingAddress = computed(
    () => order.value?.deliveries?.[0]?.shippingOrderAddress,
  )

  const paymentMethod = computed(() => {
    const transactions = order.value?.transactions
    if (!transactions?.length) return undefined
    return transactions.at(-1)?.paymentMethod
  })

  const shippingMethod = computed(() => {
    const deliveries = order.value?.deliveries
    if (!deliveries?.length) return undefined
    return deliveries.at(-1)?.shippingMethod
  })

  const paymentChangeable = computed(() => {
    const id = unref(orderId)
    return paymentChangeableList.value?.[id] ?? false
  })

  return {
    order,
    status,
    statusTechnicalName,
    total,
    subtotal,
    shippingCosts,
    shippingAddress,
    billingAddress,
    personalDetails,
    shippingMethod,
    paymentMethod,
    paymentChangeable,
    orderQuery,
  }
}
