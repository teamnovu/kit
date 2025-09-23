/**
 * Copied from:
 * https://github.com/shopware/frontends/blob/main/packages/composables/src/useProductPrice/useProductPrice.ts
 */

import type { Schemas } from '../../query/types/operations'
import { getProductTierPrices } from '@shopware/helpers'
import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import type { BrandedSchema } from '../types/schema'

/**
 * The purpose of the `useProductPrice` function is to abstract the logic
 * to expose most useful helpers for price displaying.
 *
 * @public
 * @category Product
 */
export function useProductPrice(
  product: Ref<Schemas['Product'] | undefined>,
) {
  const _cheapest: ComputedRef<
    BrandedSchema<'Product'>['calculatedCheapestPrice'] | undefined
  > = computed(() => product.value?.calculatedCheapestPrice)

  /**
   * calculatedPrices are used for product with tier prices
   */
  const _real: ComputedRef<BrandedSchema<'CalculatedPrice'> | undefined> = computed(
    () =>
      (product.value?.calculatedPrices?.length ?? 0) > 0
        ? product.value?.calculatedPrices?.[0]
        : product.value?.calculatedPrice,
  )
  const referencePrice: ComputedRef<
    BrandedSchema<'CartPriceReference'> | null | undefined
  > = computed(() => _real?.value?.referencePrice)

  const displayFrom: ComputedRef<boolean> = computed(() => {
    return (product.value?.calculatedPrices?.length ?? 0) > 1
  })

  const displayFromVariants: ComputedRef<number | false | undefined> = computed(
    () => {
      return (
        !!product.value?.parentId
        && product.value?.calculatedCheapestPrice?.hasRange
        && _real?.value?.unitPrice !== _cheapest?.value?.unitPrice
        && _cheapest?.value?.unitPrice
      )
    },
  )

  const _price: ComputedRef<BrandedSchema<'CalculatedPrice'> | undefined> = computed(
    () => {
      if (displayFrom.value && getProductTierPrices(product.value).length > 1) {
        return product.value?.calculatedPrices?.reduce((previous, current) => {
          return current.unitPrice < previous.unitPrice ? current : previous
        })
      }
      return _real.value
    },
  )

  const unitPrice: ComputedRef<number | undefined> = computed(
    () => _price.value?.unitPrice,
  )
  const totalPrice: ComputedRef<number | undefined> = computed(
    () => _price.value?.totalPrice,
  )
  const price: ComputedRef<BrandedSchema<'CalculatedPrice'> | undefined> = computed(
    () => _price.value,
  )

  const isListPrice: ComputedRef<boolean> = computed(() => {
    return !!_price.value?.listPrice?.percentage
  })

  const regulationPrice: ComputedRef<number | undefined> = computed(
    () => product.value?.calculatedPrice?.regulationPrice?.price,
  )

  const tierPrices = computed(() => getProductTierPrices(product.value))

  return {
    price,
    totalPrice,
    unitPrice,
    displayFromVariants,
    displayFrom,
    tierPrices,
    referencePrice,
    isListPrice,
    regulationPrice,
  }
}
