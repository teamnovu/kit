import useProducts from './useProducts'

export * from './inject'

export default class ShopwareComposables<Client> {
  useProducts = useProducts<Client>
}
