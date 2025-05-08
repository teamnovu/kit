import type { operations } from '#store-types'
import type { ShopwareClient } from '@teamnovu/kit-shopware-api-client'
import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export const shopwareClientKey = Symbol('shopwareClient') as InjectionKey<ShopwareClient<never>>

export function useShopwareQueryClient<Operations>() {
  const client = inject(shopwareClientKey)

  if (!client) {
    throw new Error('Shopware client not provided!')
  }

  return client as ShopwareClient<operations & Operations>
}
