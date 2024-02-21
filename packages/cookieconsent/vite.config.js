/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */

import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import pkg from './package.json';

export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      formats: ['es'],
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        nuxt: resolve(__dirname, 'src/nuxt.ts'),
      },
    },
    declarationMap: true,
    sourcemap: true,
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', ...Object.keys(pkg.dependencies ?? {})],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
      // plugins: [
      //   copy({
      //     targets: [
      //       { src: './src/runtime/**/*', dest: 'dist/runtime' },
      //     ],
      //   }),
      // ],
    },
  },
});
