# Access

You may access the CookieConsent instance in various ways.

## Contents

[[toc]]

## Composable
```js
import { useCookieConsent } from '@teamnovu/kit-cookieconsent';
const CookieConsent = useCookieConsent();

```

## Global Property
See [API doc](https://cookieconsent.orestbida.com/reference/api-reference.html)
```js
app.config.globalProperties.$cookieconsent
```
```vue
<template>
    <button @click="()=>$cookieconsent.showPreferences()"></button>
</template>
```

## Custom Attribute

There are a few handy hooks that you can use to interact with the cookie consent plugin. [See custom attribute](https://cookieconsent.orestbida.com/advanced/custom-attribute.html)

```html
<a href="#" data-cc="show-preferencesModal"> Cookie </a>
```