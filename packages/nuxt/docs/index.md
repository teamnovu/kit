# *-nuxt

Add @teamnovu/kit-* to nuxt

## Contents

[[toc]]

## Basic Setup

```bash
pnpm i @teamnovu/kit-nuxt
```

```js
export default defineNuxtConfig({

  modules: [
    [
        '@teamnovu/kit-nuxt',
        {
            // Options
        }
    ]
  ]
```

## Options

| Prop | Default | Description |
| ---- | ----- | ----------- |
| prefix | '' | Prefix the composables and components |
| animations | undefined | <a href="/packages/animations">Details</a> |