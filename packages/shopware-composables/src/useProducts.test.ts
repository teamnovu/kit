import { ShopwareClient, shopwareClientKey } from '@teamnovu/kit-shopware-api-client'
import { createApp } from 'vue'
import useProducts from './useProducts'
import { useQueryClient, VueQueryPlugin } from '@tanstack/vue-query'

test('useProducts receives products', async () => {
  const app = createApp({ template: '' })

  app.provide(shopwareClientKey, new ShopwareClient({
    apiKey: import.meta.env.VITE_SHOPWARE_ACCESS_KEY,
    baseURL: import.meta.env.VITE_SHOPWARE_URL,
  }))

  app.use(VueQueryPlugin)

  await app.runWithContext(async () => {
    const client = useQueryClient()

    const data = await client.fetchQuery(useProducts())

    expect(data).toBeTruthy()
  })
})
