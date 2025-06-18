import type { Schemas } from '#store-types'
import type { MaybeRef } from 'vue'
import { computed, unref } from 'vue'

type DetailProduct<S extends Schemas> = S['CustomProductDetailResponse']['product']

export function getProductVariantForOptions<S extends Schemas>(
  product: DetailProduct<S>,
  optionIds: string[],
) {
  const variants = product.extensions?.variants

  if (optionIds.length === 0) {
    // if no options are selected, return the first variant without options and
    // if there is none, return the first variant
    return variants?.find(v => v.optionIds?.length === 0) ?? variants?.[0]
  }

  return variants?.find(v => v.optionIds?.every(optId => optionIds.includes(optId)))
}

export function useProductVariantForOptions<S extends Schemas>(
  product: MaybeRef<DetailProduct<S>>,
  optionIds: MaybeRef<string[]>,
) {
  return computed(() => getProductVariantForOptions(unref(product), unref(optionIds)))
}
