import type { Schemas as BaseSchemas, operations } from '#store-types'
import { useListAddressesQueryOptions } from './address/listAddressesQueryOptions'
import { useCartAddItemMutation } from './cart/useCartAddItemMutation'
import { useCartQueryOptions } from './cart/useCartQueryOptions'
import { useCartRemoveItemMutation } from './cart/useCartRemoveItemMutation'
import { useCartUpdateItemMutation } from './cart/useCartUpdateItemMutation'
import { useContextOptions } from './context/useContextOptions'
import { useContextUpdate } from './context/useContextUpdate'
import useIsLoggedIn from './customer/useIsLoggedIn'
import { useLoginMutation } from './customer/useLoginMutation'
import { useReadCustomerQueryOptions } from './customer/useReadCustomerQueryOptions'
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

  useCartQueryOptions = useCartQueryOptions<Operations>
  useCartUpdateItemMutation = useCartUpdateItemMutation<Operations>
  useCartRemoveItemMutation = useCartRemoveItemMutation<Operations>
  useCartAddItemMutation = useCartAddItemMutation<Operations>

  useIsLoggedIn = useIsLoggedIn<Operations>
  useLoginMutation = useLoginMutation<Operations>

  useReadCustomerQueryOptions = useReadCustomerQueryOptions<Operations>

  useListAddressesQueryOptions = useListAddressesQueryOptions<Operations>
}
