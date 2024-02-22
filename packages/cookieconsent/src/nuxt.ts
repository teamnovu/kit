import {
  addComponent,
  addImports,
  defineNuxtModule,
} from '@nuxt/kit';
import type { NuxtModule } from '@nuxt/schema';
import type { CookieConsentConfig } from './types';

const module: NuxtModule<CookieConsentConfig> = defineNuxtModule<CookieConsentConfig>({

  meta: {
    name: '@teamnovu/kit-cookieconsent',
    configKey: 'cookieconsent',
  },

  setup(options, nuxt) {
    // eslint-disable-next-line no-param-reassign
    nuxt.options.runtimeConfig.public.cookieconsent = {
      ...options,
    };

    // auto import composables
    addImports([
      {
        name: 'useCookieConsent',
        from: '@teamnovu/kit-cookieconsent',
      },
      {
        name: 'useCookieGuard',
        from: '@teamnovu/kit-cookieconsent',
      },
    ]);

    // auto import components
    addComponent({
      name: 'CookieGuard',
      export: 'CookieGuard',
      filePath: '@teamnovu/kit-cookieconsent',
    });
  },

});

export default module;
