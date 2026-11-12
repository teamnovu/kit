import { resolve } from 'node:path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@teamnovu/kit-shopware-api-client': resolve(__dirname, '../shopware-api-client/src/index.ts'),
    },
  },
  test: {
    include: ['**/*.test.ts'],
    globals: true,
    env: loadEnv(mode, __dirname, ''),
  },
}))
