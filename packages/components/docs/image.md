# The Image component <Badge type="danger" text="Experimental" />

This component is designed with our CMS in mind. However it can also be used universally if we keep to the same input structure:

## Contents

[[toc]]

## Props

```ts
interface Props {
  src: Image | string;
}

interface Image {
  svg: string;
  src: string;
  small: string;
  normal: string;
  large: string;
  alt: string;
}
```

## Examples

::: details Code
```vue
<script setup>
import { Image } from '@teamnovu/kit-components';
</script>

<Image src="http://placekitten.com/200/300" style="margin: auto" />
```
:::

<script setup>
import { Image } from '@teamnovu/kit-components';
</script>

<Image src="http://placekitten.com/200/300" style="margin: auto" />