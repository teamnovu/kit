import { operations } from '#store-types'
import { useContextOptions } from './context/useContextOptions'
import { useContextUpdate } from './context/useContextUpdate'
import { useProductQueryOptions } from './products/useProductQueryOptions'

export * from './inject'
export * from './usePagination'
export * from './useSuspenseQuery'

export default class ShopwareComposables<Operations extends operations> {
  useProductQueryOptions = useProductQueryOptions<Operations>
  useContextOptions = useContextOptions<Operations>
  useContextUpdate = useContextUpdate<Operations>
}
