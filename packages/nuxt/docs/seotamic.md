# SEOtamic

A composable that maps all the SEO and social information from [SEOtamic](https://statamic.com/addons/cnj/seotamic). Some information can be overridden by environment variables.

## Contents

[[toc]]

## Usage

Request folloing fields from the GraphQL API:

```gql
site {
  locale
}
alternates { # for multi-sites
  language
  permalink
}
seotamic_meta {
  canonical
  description
  robots
  title
}
seotamic_social {
  description
  image
  title
  site_name
}   
```

To use `useSeotamic` pass in a reactive page object.

```vue
<script setup>
import { PageQuery } from '#gql'

// ... fetch the page (this is just an example)
const route = useRoute()
const { data } = await useAsyncGql({
  operation: 'Page',
  variables: { uri: route.path },
})

const page = computed(() => data.value?.entry) as Ref<Force<PageQuery>['entry']>

// use the composable
useSeotamic(page)

</script>
```

## Overrides

Define in the .env file and the nuxt config

| Environment | Description |
| ---- | ----------- |
| SEO_LOCALE | Custom locale |
| SEO_ROBOTS | Custom robots value |
| SEO_THEME | Value for `theme-color` |
| SEO_TYPE | Value for `og:type` |
| SEO_IMAGE | An image link for `og:image` |