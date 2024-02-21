<script setup>
import { getCurrentInstance, onMounted } from 'vue'
import { createCookieConsent } from '@teamnovu/kit-cookieconsent';
import { useRouter } from 'vitepress'
import '@teamnovu/kit-cookieconsent/style';

//setup
if (!import.meta.env.SSR) {
  const instance = getCurrentInstance();
  const app = instance.appContext.app;
  app.use(createCookieConsent());
  onMounted(()=>{
    const router = useRouter();
    router.onBeforeRouteChange = () => { app.config.globalProperties.$cookieconsent?.reset(true); }
    window.onbeforeunload = () => { app.config.globalProperties.$cookieconsent?.reset(true); }
  })
}

</script>
<style>
body {
    --cc-font-family: var(--vp-font-family-base);
    --cc-btn-primary-bg: var(--vp-c-brand);
    --cc-btn-primary-border-color: #{var(--vp-c-brand)};
    --cc-btn-primary-hover-bg: var(--vp-c-brand-darker);
    --cc-toggle-on-bg: var(--vp-c-brand);
}
</style>

# Vue Cookie Consent

When you engage in any form of user tracking, such as analytics, it is essential to include a cookie banner or popup. This notification should inform users about the types of information being tracked and provide the option to disable non-essential cookies. 

Cookie Consent offers a straightforward solution for implementing a cookie consent popup. It is built upon the reliable [cookieconsent](https://github.com/orestbida/cookieconsent) library and provides a good default configuration along with pre-defined texts in English but can also be easily extended.


## Contents

[[toc]]

## Setup

```bash
pnpm i @teamnovu/kit-cookieconsent
```

### Vue 3
```js
import { createCookieConsent } from '@teamnovu/kit-cookieconsent';
import '@teamnovu/kit-cookieconsent/style'; // or import in a css file

const cookieConsent = createCookieConsent({ /* options */ });
app.use(cookieConsent);
```

### Nuxt
Setup the module in `nuxt.config.js`:
```js
// nuxt.config.js
modules: [
   '@teamnovu/kit-cookieconsent/nuxt',
]
```

and create a plugin file `plugins/cookieconsent.js`:
```js
import {
  createCookieConsent,
  CookieConsentConfig,
  useCookieConsent,
} from '@teamnovu/kit-cookieconsent'

const consentConfig: CookieConsentConfig = { /* ... */ }

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(createCookieConsent(consentConfig))

  if (process.client) {
    const cookieconsent = useCookieConsent()!
    // const gtm = useGtm()

    watch(
      cookieconsent.services,
      (services) => {
        // gtm?.enable(services.analytics ?? false)
      },
      { immediate: true }
    )
  }
})

```
You can find available [options here](https://cookieconsent.orestbida.com/reference/configuration-reference.html).



## Styling

You can customize the default styling easily with a few handy styling variables. You can find a [complete list here](https://github.com/orestbida/cookieconsent/blob/master/src/cookieconsent.css).

```scss
body {
    --cc-font-family: #{var(--vp-font-family-base)};
    --cc-btn-primary-bg: #{var(--vp-c-brand)};
    --cc-btn-primary-border-color: #{var(--vp-c-brand)};
    --cc-btn-primary-hover-bg: #{var(--vp-c-brand-darker)};
    --cc-toggle-bg-on: #{var(--vp-c-brand)};
}
```