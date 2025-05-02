import { operations } from '#store-types'
import { useContextOptions } from './context/useContextOptions'
import { useContextUpdate } from './context/useContextUpdate'
import { useCategoryQueryOptions } from './products/useCategoryQueryOptions'
import { useProductQueryOptions } from './products/useProductQueryOptions'

export * from './inject'
export * from './keys'
export * from './products/useProductPrice'
export * from './usePagination'

export default class ShopwareComposables<Operations extends operations> {
  useProductQueryOptions = useProductQueryOptions<Operations>
  useCategoryQueryOptions = useCategoryQueryOptions<Operations>
  useContextOptions = useContextOptions<Operations>
  useContextUpdate = useContextUpdate<Operations>
}
