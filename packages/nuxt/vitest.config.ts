import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '#imports': resolve(__dirname, './tests/stubs/imports.ts'),
      '@teamnovu/kit-animations': resolve(__dirname, '../animations/src/index.ts'),
      '@teamnovu/kit-components': resolve(__dirname, '../components/src/index.ts'),
      '@teamnovu/kit-composables': resolve(__dirname, '../composables/src/index.ts'),
      'vue': resolve(__dirname, '../components/node_modules/vue'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
