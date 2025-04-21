import { operations } from '#store-types'
import { ShopwareClient, shopwareClientKey } from '@teamnovu/kit-shopware-api-client'
import { inject } from 'vue/dist/vue.js'

export function useShopwareQueryClient<Operations>() {
  const client = inject(shopwareClientKey)

  if (!client) {
    throw new Error('Shopware client not provided!')
  }

  return client as ShopwareClient<operations & Operations>
}
