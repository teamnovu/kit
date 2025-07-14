import type { ShopwareClient } from '@teamnovu/kit-shopware-api-client'
import type { InjectionKey } from 'vue'
import { inject } from 'vue'
import type { Operations } from './query/types/operations'

export const shopwareClientKey = Symbol('shopwareClient') as InjectionKey<ShopwareClient<never>>

export function useShopwareQueryClient() {
  const client = inject(shopwareClientKey)

  if (!client) {
    throw new Error('Shopware client not provided!')
  }

  return client as ShopwareClient<Operations>
}
