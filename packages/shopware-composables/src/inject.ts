import { operations } from '#store-types'
import { ShopwareClient } from '@teamnovu/kit-shopware-api-client'
import { inject, InjectionKey } from 'vue'

export const shopwareClientKey = Symbol('shopwareClient') as InjectionKey<ShopwareClient<any>>

export function useShopwareQueryClient<Operations>() {
  const client = inject(shopwareClientKey)

  if (!client) {
    throw new Error('Shopware client not provided!')
  }

  return client as ShopwareClient<operations & Operations>
}
