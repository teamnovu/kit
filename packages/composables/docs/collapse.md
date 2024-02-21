# Collapse

A simple collapse composable.

## Contents

[[toc]]

## Types

```ts
interface CollapsableOptions extends UseTransitionOptions {
  dimension?: 'width' | 'height';
  initiallyOpen?: boolean;
}
```

For the `UseTransitionOptions` type take a look at [Vueuse useTransition](https://vueuse.org/core/useTransition/)

## Options

| Prop | Default | Description |
| ---- |  -----  | ----------- |
| dimension | `'height'` | The dimension to work with. `'width'` or `'height'`. |
| duration | `300` | The animation duration when opening / closing. |
| transition | `TransitionPresets.easeInOutCubic` | The easing function of the open / close animation. |
| initiallyClosed | `false` | If the collapse should be initially closed. |
| controlled | `false` | Allow the collapse component to be controlled by a collapse-controller - e.g. an accordion. |

## Examples

::: details
```vue
<script setup>
import { ref } from 'vue';
import { useCollapse } from '@teamnovu/kit-composables';

const collapseRef = ref();
const open = useCollapse(collapseRef);
</script>

<button @click="open = !open" class="medium brand">
  Toggle
</button>
<div ref="collapseRef">
  <div class="details custom-block">
    <p>
      Voluptate mollit aliqua excepteur exercitation nulla eiusmod mollit. Elit consectetur excepteur eu nisi Lorem eu. Reprehenderit dolore adipisicing enim consectetur sunt velit. Cillum fugiat deserunt esse ea proident. Minim consectetur cillum enim veniam adipisicing Lorem duis aliqua est ex.
    </p>
    <p>
      Tempor do veniam laborum et esse do occaecat aliquip proident sit officia qui eiusmod veniam. Eu proident adipisicing laborum deserunt sunt exercitation id sunt. Non do eu dolore sit consectetur veniam nisi esse minim ad ipsum ullamco aliqua qui. Incididunt eiusmod enim quis ipsum exercitation aute. Voluptate adipisicing nulla deserunt ullamco minim velit aliqua ex et aliquip deserunt. Culpa sunt ut commodo aliqua aute nulla ipsum duis adipisicing eiusmod fugiat quis.
    </p>
    <p>
      Minim sunt commodo officia in. In consectetur adipisicing tempor sint tempor quis. Est laboris laborum nostrud commodo proident. Deserunt ullamco aute esse veniam. Ut dolore velit cillum non nisi ad id culpa esse nulla labore commodo duis veniam.
    </p>
  </div>
</div>
```
:::

<script setup>
import { ref } from 'vue';
import { useCollapse } from '@teamnovu/kit-composables';

const collapseRef = ref();
const open = useCollapse(collapseRef);
</script>

<button @click="open = !open" class="medium brand">
  Toggle
</button>
<div ref="collapseRef">
  <div class="details custom-block">
    <p>
      Voluptate mollit aliqua excepteur exercitation nulla eiusmod mollit. Elit consectetur excepteur eu nisi Lorem eu. Reprehenderit dolore adipisicing enim consectetur sunt velit. Cillum fugiat deserunt esse ea proident. Minim consectetur cillum enim veniam adipisicing Lorem duis aliqua est ex.
    </p>
    <p>
      Tempor do veniam laborum et esse do occaecat aliquip proident sit officia qui eiusmod veniam. Eu proident adipisicing laborum deserunt sunt exercitation id sunt. Non do eu dolore sit consectetur veniam nisi esse minim ad ipsum ullamco aliqua qui. Incididunt eiusmod enim quis ipsum exercitation aute. Voluptate adipisicing nulla deserunt ullamco minim velit aliqua ex et aliquip deserunt. Culpa sunt ut commodo aliqua aute nulla ipsum duis adipisicing eiusmod fugiat quis.
    </p>
    <p>
      Minim sunt commodo officia in. In consectetur adipisicing tempor sint tempor quis. Est laboris laborum nostrud commodo proident. Deserunt ullamco aute esse veniam. Ut dolore velit cillum non nisi ad id culpa esse nulla labore commodo duis veniam.
    </p>
  </div>
</div>
