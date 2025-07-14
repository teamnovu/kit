import type { MaybeRef } from 'vue'
import { computed, unref } from 'vue'
import type { Schemas } from '../../query/types'

export function useOrderPayment(
  order: MaybeRef<Schemas['Order'] | null | undefined>,
) {
  const activeTransaction = computed(() =>
    unref(order)?.transactions?.find(t => t.paymentMethod?.active === true))

  const paymentMethod = computed(() => activeTransaction.value?.paymentMethod)
  const state = computed(() => activeTransaction.value?.stateMachineState)

  const isAsynchronous = computed(
    () =>
      // @ts-expect-error - This property does not seem to be declared in the typescript types
      activeTransaction.value?.paymentMethod?.asynchronous
      && activeTransaction.value?.paymentMethod?.afterOrderEnabled,
  )

  return {
    isAsynchronous,
    activeTransaction,
    state,
    paymentMethod,
  }
}

