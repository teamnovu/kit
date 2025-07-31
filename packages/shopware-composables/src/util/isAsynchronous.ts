import { unref, type MaybeRef } from 'vue'
import type { Schemas } from '../query/types/operations'

export const isAsynchronousOrder = (order: MaybeRef<Schemas['Order'] | null | undefined>) => {
  const activeTransaction = unref(order)?.transactions?.find(t => t.paymentMethod?.active)
  // @ts-expect-error - This property does not seem to be declared in the typescript types
  return activeTransaction?.paymentMethod?.asynchronous && activeTransaction?.paymentMethod?.afterOrderEnabled
}
