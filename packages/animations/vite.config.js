import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      formats: ['es'],
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
      cssFileName: 'style',
    },
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      external: ['vue', ...Object.keys(pkg.dependencies ?? {})],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
