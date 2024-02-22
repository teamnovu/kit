import {
  defineNuxtModule,
  addImports,
  addComponent,
  addPlugin,
  createResolver,
  addImportsDir,
} from '@nuxt/kit';
import type { NuxtModule } from '@nuxt/schema';
import * as Components from '@teamnovu/kit-components';
import * as Composables from '@teamnovu/kit-composables';
import { type Options as AnimationsOptions } from '@teamnovu/kit-animations';

export interface JktoolsNuxtOptions {
  prefix?: string
  animations?: AnimationsOptions
}

/**
 * jktools for Nuxt
 * Usage:
 *
 * ```ts
 * // nuxt.config.js
 * export default {
 *   modules: ['@vueuse/jktools']
 * }
 * ```
 */
const module: NuxtModule<JktoolsNuxtOptions> = defineNuxtModule<JktoolsNuxtOptions>({
  meta: {
    name: 'jktools',
    configKey: 'jktools',
  },
  defaults: {
    prefix: '',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    // eslint-disable-next-line no-param-reassign
    nuxt.options.runtimeConfig.public.jktools = {
      ...options,
    };

    // auto import composables
    addImports(Object.keys(Composables).map((name: string) => ({
      name,
      as: `use${options.prefix}${name.substring(3)}`,
      from: '@teamnovu/kit-composables',
    })));
    addImportsDir(resolve('./runtime/composables'));

    // auto import components
    Object.keys(Components).forEach((name: string) => addComponent({
      name: options.prefix + name,
      export: name,
      filePath: '@teamnovu/kit-components',
    }));

    // auto import plugins
    addPlugin({
      src: resolve('./runtime/animations.ts'),
    });
  },
});

declare module '@nuxt/schema' {
  // eslint-disable-next-line no-unused-vars
  interface NuxtConfig {
    jktools?: JktoolsNuxtOptions
  }
  // eslint-disable-next-line no-unused-vars
  interface NuxtOptions {
    jktools?: JktoolsNuxtOptions
  }
}

export default module;
