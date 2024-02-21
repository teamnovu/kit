<script setup>
import { getCurrentInstance, onMounted } from 'vue'
import { createCookieConsent, CookieGuard, useCookieGuard } from '@teamnovu/kit-cookieconsent';
import { useRouter } from 'vitepress'
import '@teamnovu/kit-cookieconsent/style';

// setup
if (!import.meta.env.SSR) {
   const instance = getCurrentInstance();
   const app = instance.appContext.app;
   app.use(createCookieConsent({
      categories: {
         functional: {
            services: {
               youtube: { label: 'Youtube Embed' },
               vimeo: { label: 'Vimeo Embed' },
               srf: { label: 'SRF Embed' },
            },
         },
      },
   }));
   onMounted(()=>{
      const router = useRouter();
      router.onBeforeRouteChange = () => { app.config.globalProperties.$cookieconsent?.reset(true); }
      window.onbeforeunload = () => { app.config.globalProperties.$cookieconsent?.reset(true); }
   })
}

// for composable example
const { allowed } = useCookieGuard('functional.srf');

</script>
<style>
body {
    --cc-font-family: var(--vp-font-family-base);
    --cc-btn-primary-bg: var(--vp-c-brand);
    --cc-btn-primary-border-color: #{var(--vp-c-brand)};
    --cc-btn-primary-hover-bg: var(--vp-c-brand-darker);
    --cc-toggle-on-bg: var(--vp-c-brand);
}
.video {
   position: relative;
   aspect-ratio: 16/9;
   background-color: var(--vp-custom-block-details-bg);
}
</style>


# CookieGuard

This composable and component help you manage third-party content (like YouTube embed, Google Maps, or Recaptcha) by blocking in until approval has been given.

## Contents

[[toc]]

## Configuration

Configure the services you want to use in the `cookieconsent` plugin options.
```js
categories: {
   functional: {
      enabled: false,
      readOnly: false,
      services: {
         /* configure services here */
         youtube: { label: 'Youtube Embed' },
         vimeo: { label: 'Vimeo Embed' },
      },
   },
},
```

## Simple

Simply wrap any content that you'd like to hide in `CookieGuard` and set the service name from the config (e.g. `service="functional.youtube"`).

::: details Code
```vue
<div class="aspect-[16/9] overflow-hidden rounded bg-black-soft text-white">
    <CookieGuard service="functional.youtube">
       <iframe
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=66GPC09X3WNfVPUm"
       />
    </CookieGuard>
</div>

<script setup>
import { CookieGuard } from '@teamnovu/kit-cookieconsent';
</script>
```
:::
<div class="video">
    <CookieGuard service="functional.youtube">
       <iframe
        width="100%"
        height="100%"
        frameborder="0"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=66GPC09X3WNfVPUm"
       />
    </CookieGuard>
</div>

## Custom Message

You can also provide a `#rejected` template to show a custom message.

::: details Code
```vue
<div class="video">
    <CookieGuard service="functional.vimeo">
      <template #default>
        <iframe src="https://player.vimeo.com/video/375468729?h=d063a6fe74" width="100%" height="100%" frameborder="0"></iframe>
       </template>
       <template #rejected="{ acceptService, serviceName }">
         <div style="height:100%;padding:4rem">
            <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid white;">
               <strong>Hi there, wanna have some {{ serviceName }} cookies?</strong>
               <button
                  style="padding:2rem 4rem;background-color:var(--vp-c-brand);color:white;border:none;border-radius:0.5rem;cursor:pointer;margin-top:2rem;"
                  @click="() => acceptService('functional.vimeo')"
               >
                  🍪 Oh boi! 🍪
               </button>
            </div>
         </div>
       </template>
    </CookieGuard>
</div>

<script setup>
import { CookieGuard } from '@teamnovu/kit-cookieconsent';
</script>
```
:::
<div class="video">
    <CookieGuard service="functional.vimeo">
      <template #default>
        <iframe src="https://player.vimeo.com/video/375468729?h=d063a6fe74" width="100%" height="100%" frameborder="0"></iframe>
       </template>
       <template #rejected="{ acceptService, serviceName }">
         <div style="height:100%;padding:4rem">
            <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;border:3px solid white;">
               <strong>Hi there, wanna have some {{ serviceName }} cookies?</strong>
               <button
                  style="padding:2rem 4rem;background-color:var(--vp-c-brand);color:white;border:none;border-radius:0.5rem;cursor:pointer;margin-top:2rem;"
                  @click="() => acceptService('functional.vimeo')"
               >
                  🍪 Oh boi! 🍪
               </button>
            </div>
         </div>
       </template>
    </CookieGuard>
</div>

## Composable

If you'd like more control, the cookie guard also comes as composable.

::: details Code
```vue
<div>
    SRF State: {{ allowed }}
</div>

<script setup>
import { useCookieGuard } from '@teamnovu/kit-cookieconsent';
const { allowed, acceptService } = useCookieGuard('functional.srf');

function foo() {
   // only on client
   acceptService('functional.srf');
}
</script>
```
:::
<div>
    SRF State: {{ allowed ? 'Allowed' : 'Nope' }}
</div>