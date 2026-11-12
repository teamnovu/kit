import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@teamnovu/kit-composables': resolve(__dirname, '../composables/src/index.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
