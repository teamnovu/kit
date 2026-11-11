import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    mainFields: ['module'],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    server: {
      deps: {
        inline: ['vanilla-cookieconsent'],
      },
    },
  },
})
