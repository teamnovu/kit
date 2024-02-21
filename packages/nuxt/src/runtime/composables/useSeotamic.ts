import type { Ref } from 'vue';
// @ts-expect-error
// eslint-disable-next-line import/no-unresolved
import { useHeadSafe, useRuntimeConfig } from '#imports';

export default function useSeotamic(page: Ref<any>) {
  const config = useRuntimeConfig();
  useHeadSafe({
    htmlAttrs: { lang: config.public.SEO_LOCALE || page.value?.site?.locale },
    title: page.value?.seotamic_meta?.title,
    meta: [
      // meta
      { hid: 'robots', name: 'robots', content: config.public.SEO_ROBOTS || page.value?.seotamic_meta?.robots },
      { hid: 'description', name: 'description', content: config.public.SEO_DESCRIPTION || page.value?.seotamic_meta?.description },
      ...(config.public.SEO_THEME ? [{ hid: 'theme', name: 'theme-color', content: config.public.SEO_THEME }] : []),
      // social
      { hid: 'og:type', property: 'og:type', content: config.public.SEO_TYPE || 'website' },
      { hid: 'og:locale', property: 'og:locale', content: config.public.SEO_LOCALE || page.value?.site?.locale },
      { hid: 'og:title', property: 'og:title', content: page.value?.seotamic_social?.title },
      { hid: 'og:site_name', property: 'og:site_name', content: page.value?.seotamic_social?.site_name },
      { hid: 'og:description', property: 'og:description', content: page.value?.seotamic_social?.description },
      { hid: 'og:url', property: 'og:url', content: page.value?.seotamic_meta?.canonical },
      { hid: 'og:image', property: 'og:image', content: config.public.SEO_IMAGE || page.value?.seotamic_social?.image },
    ],
    link: [
      { hid: 'canonical', rel: 'canonical', href: page.value?.seotamic_meta?.canonical },
      ...(page.value?.alternates
        ? page.value.alternates.map((alternate: any) => ({
          rel: 'alternate',
          hreflang: alternate.locale,
          href: alternate.permalink,
        }))
        : []),
    ],
  });
}
