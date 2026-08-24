import { useQueryClient } from '@tanstack/vue-query'
import type { ShopwareClient } from '@teamnovu/kit-shopware-api-client'
import type { InjectionKey } from 'vue'
import { inject } from 'vue'
import type { Operations } from './query/types/operations'

export const shopwareClientKey = Symbol('shopwareClient') as InjectionKey<ShopwareClient<Operations>>

export function useShopwareQueryClient() {
  const client = inject(shopwareClientKey)

  if (!client) {
    throw new Error('Shopware client not provided!')
  }

  return client as ShopwareClient<Operations>
}

/**
 * The tanstack QueryClient holding all queries made through the shopware client,
 * resolved via the client's queryClientId (the default QueryClient if not set).
 */
export function useShopwareVueQueryClient() {
  return useQueryClient(useShopwareQueryClient().queryClientId)
}
