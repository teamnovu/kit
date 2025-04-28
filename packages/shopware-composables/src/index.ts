import { operations } from '#store-types'
import { productQueryOptions } from './productQueryOptions'

export * from './inject'

export { usePagination } from './usePagination'

export default class ShopwareComposables<Client extends operations> {
  productQueryOptions = productQueryOptions<Client>
}
