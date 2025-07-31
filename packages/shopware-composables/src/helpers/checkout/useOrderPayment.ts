import type { MaybeRef } from 'vue'
import { computed, unref } from 'vue'
import type { Schemas } from '../../query/types/operations'
import type { BrandedSchema } from '../types/schema'
import { isAsynchronousOrder } from '../../util'

export function useOrderPayment(
  order: MaybeRef<Schemas['Order'] | null | undefined>,
) {
  const activeTransaction = computed(() =>
    unref(order)?.transactions?.find(t => t.paymentMethod?.active === true))

  const paymentMethod = computed(() => activeTransaction.value?.paymentMethod as BrandedSchema<'PaymentMethod'> | undefined)
  const state = computed(() => activeTransaction.value?.stateMachineState as BrandedSchema<'StateMachineState'> | undefined)

  const isAsynchronous = computed(() => isAsynchronousOrder(order))

  return {
    isAsynchronous,
    activeTransaction,
    state,
    paymentMethod,
  }
}
