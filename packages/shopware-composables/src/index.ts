import { operations } from '#store-types'
import { useContextOptions } from './context/useContextOptions'
import { useContextUpdate } from './context/useContextUpdate'
import { useCategoryQueryOptions } from './products/useCategoryQueryOptions'
import { useProductListingQueryOptions } from './products/useProductListingQueryOptions'
import { useProductQueryOptions } from './products/useProductQueryOptions'

export * from './general/useSeoUrl'
export * from './inject'
export * from './keys'
export * from './products/useProductPrice'
export * from './usePagination'

export default class ShopwareComposables<Operations extends operations> {
  useProductListingQueryOptions = useProductListingQueryOptions<Operations>
  useCategoryQueryOptions = useCategoryQueryOptions<Operations>
  useContextOptions = useContextOptions<Operations>
  useContextUpdate = useContextUpdate<Operations>
  useProductQueryOptions = useProductQueryOptions<Operations>
}
