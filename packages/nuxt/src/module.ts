import {
  defineNuxtModule,
  addImports,
  addComponent,
  addPlugin,
  createResolver,
  addImportsDir,
} from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'
import * as Components from '@teamnovu/kit-components'
import * as Composables from '@teamnovu/kit-composables'
import { type Options as AnimationsOptions } from '@teamnovu/kit-animations'

export interface NovuKitNuxtOptions {
  prefix?: string
  animations?: AnimationsOptions
}

/**
 * NovuKit for Nuxt
 * Usage:
 *
 * ```ts
 * // nuxt.config.js
 * export default {
 *   modules: ['@teamnovu/kit-nuxt']
 * }
 * ```
 */
const module: NuxtModule<NovuKitNuxtOptions> = defineNuxtModule<NovuKitNuxtOptions>({
  meta: {
    name: 'kit',
    configKey: 'kit',
  },
  defaults: {
    prefix: '',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.kit = {
      ...options,
    }

    // auto import composables
    addImports(Object.keys(Composables).map((name: string) => ({
      name,
      as: `use${options.prefix}${name.substring(3)}`,
      from: '@teamnovu/kit-composables',
    })))
    addImportsDir(resolve('./runtime/composables'))

    // auto import components
    Object.keys(Components).forEach((name: string) => addComponent({
      name: options.prefix + name,
      export: name,
      filePath: '@teamnovu/kit-components',
    }))

    // auto import plugins
    addPlugin({
      src: resolve('./runtime/animations.ts'),
    })
  },
})

declare module '@nuxt/schema' {

  interface NuxtConfig {
    kit?: NovuKitNuxtOptions
  }

  interface NuxtOptions {
    kit?: NovuKitNuxtOptions
  }
}

export default module
