import { useQuery, VueQueryPlugin } from '@tanstack/vue-query'
import { ShopwareClient } from '@teamnovu/kit-shopware-api-client'
import { createApp } from 'vue'
import { shopwareClientKey } from './inject'
import { useProductQueryOptions } from './useProductQueryOptions'

test('useProducts receives products', async () => {
  const app = createApp({ template: '' })

  app.provide(shopwareClientKey, new ShopwareClient({
    apiKey: import.meta.env.VITE_SHOPWARE_ACCESS_KEY,
    baseURL: import.meta.env.VITE_SHOPWARE_URL,
  }))

  app.use(VueQueryPlugin)

  await app.runWithContext(async () => {
    const { data, suspense } = useQuery(useProductQueryOptions('/Food/Bakery-products/'))

    await suspense()

    expect(data).toBeTruthy()
  })
})
