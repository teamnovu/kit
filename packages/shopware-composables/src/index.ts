import type { Schemas as BaseSchemas, operations } from '#store-types'
import { useContextOptions } from './context/useContextOptions'
import { useContextUpdate } from './context/useContextUpdate'
import { useCategoryQueryOptions } from './products/useCategoryQueryOptions'
import { useProductListingQueryOptions } from './products/useProductListingQueryOptions'
import { useProductQueryOptions } from './products/useProductQueryOptions'
import { useProductVariantForOptions } from './products/useProductVariantForOptions'

export * from './general/useSeoUrl'
export * from './inject'
export * from './keys'
export * from './products/useProductPrice'
export * from './products/useProductVariantForOptions'
export * from './usePagination'
export * from './util/url'

export default class ShopwareComposables<Operations extends operations, Schemas extends BaseSchemas> {
  useProductListingQueryOptions = useProductListingQueryOptions<Operations>
  useCategoryQueryOptions = useCategoryQueryOptions<Operations>
  useContextOptions = useContextOptions<Operations>
  useContextUpdate = useContextUpdate<Operations>
  useProductQueryOptions = useProductQueryOptions<Operations>
  useProductVariantForOptions = useProductVariantForOptions<Schemas>
}
