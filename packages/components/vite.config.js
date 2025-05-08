import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    emptyOutDir: false,
    lib: {
      formats: ['es'],
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        Image: resolve(__dirname, 'src/Image.vue'),
        Dialog: resolve(__dirname, 'src/Dialog.vue'),
        Collapse: resolve(__dirname, 'src/Collapse.vue'),
        AccessibleComponent: resolve(__dirname, 'src/AccessibleComponent.vue'),
        Accordion: resolve(__dirname, 'src/accordion/Accordion.vue'),
        AccordionItem: resolve(__dirname, 'src/accordion/AccordionItem.vue'),
        AccordionHeader: resolve(
          __dirname,
          'src/accordion/AccordionHeader.vue',
        ),
        AccordionBody: resolve(__dirname, 'src/accordion/AccordionBody.vue'),
        HAccordion: resolve(__dirname, 'src/accordion/HAccordion.vue'),
        HAccordionItem: resolve(__dirname, 'src/accordion/HAccordionItem.vue'),
      },
    },
    sourcemap: process.env.NODE_ENV === 'development',
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
    },
  },
})
