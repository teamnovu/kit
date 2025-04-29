import { operations } from '#store-types'
import { useProductQueryOptions } from './useProductQueryOptions'

export * from './inject'
export * from './usePagination'

export default class ShopwareComposables<Client extends operations> {
  useProductQueryOptions = useProductQueryOptions<Client>
}
