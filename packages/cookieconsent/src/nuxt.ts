import {
  addComponent,
  addImports,
  defineNuxtModule,
} from '@nuxt/kit';
import type { CookieConsentConfig } from './types';

export default defineNuxtModule<CookieConsentConfig>({

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
