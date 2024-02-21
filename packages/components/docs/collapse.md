<script lang="ts" setup>
import { ref } from 'vue';
import { Collapse } from '@teamnovu/kit-components';

const controlledOpen = ref(false);
</script>

# The Collapse component

A simple headless component wrapping the `useCollapse` composable.

## Contents

[[toc]]

## Props

```ts
interface Props {
  open: boolean;
  dimension?: 'width' | 'height';
  duration?: number;
  transition?: MaybeRef<EasingFunction | CubicBezierPoints>;
  initiallyClosed?: boolean;
  controlled?: boolean;
}
```

| Prop | Default | Description |
| ---- |  -----  | ----------- |
| open | `true` | Defines the open-state of the collapse. Two-way binding through `v-model:open` allowed. |
| dimension | `'height'` | The dimension to work with. `'width'` or `'height'`. |
| duration | `300` | The animation duration when opening / closing. |
| transition | `TransitionPresets.easeInOutCubic` | The easing function of the open / close animation. |
| initiallyClosed | `false` | If the collapse should be initially closed. |
| controlled | `false` | Allow the collapse component to be controlled by a collapse-controller - e.g. an accordion. |

## Examples


### Simple usage

::: details Code
```vue
<script lang="ts" setup>
import { Collapse } from '@teamnovu/kit-components';
</script>

<Collapse v-slot="{ ref, toggle }">
  <button @click="toggle" class="medium brand collapse-button">
    Toggle
  </button>
  <div :ref="ref" class="collapse-block">
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
</Collapse>
```
:::

<Collapse v-slot="{ ref, toggle }">
  <button @click="toggle" class="medium brand collapse-button">
    Toggle
  </button>
  <div :ref="ref" class="collapse-block">
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
</Collapse>

### V-Model usage

::: details Code
```vue
<script lang="ts" setup>
import { ref } from 'vue';
import { Collapse } from '@teamnovu/kit-components';

const controlledOpen = ref(false);
</script>

<Collapse v-slot="{ ref }" v-model:open="controlledOpen">
  <button @click="controlledOpen = !controlledOpen" class="medium brand collapse-button">
    Toggle
  </button>
  <div :ref="ref" class="collapse-block">
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
</Collapse>
```
:::

<Collapse v-slot="{ ref }" v-model:open="controlledOpen">
  <button @click="controlledOpen = !controlledOpen" class="medium brand collapse-button">
    Toggle
  </button>
  <div :ref="ref" class="collapse-block">
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
</Collapse>