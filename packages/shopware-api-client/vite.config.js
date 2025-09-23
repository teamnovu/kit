import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

export default defineConfig({
  plugins: [dts()],
  root: resolve(__dirname),
  esbuild: {
    keepNames: true,
  },
  build: {
    emptyOutDir: false,
    lib: {
      formats: ['es'],
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
      },
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', ...Object.keys(pkg.dependencies ?? {})],
    },
  },
})
