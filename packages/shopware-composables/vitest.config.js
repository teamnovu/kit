import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  test: {
    include: ['**/*.test.ts'],
    globals: true,
    env: loadEnv(mode, __dirname, ''),
  },
}))
