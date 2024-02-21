# Accordion

A simple accordion-composable. A call to the function `useAccordion` returns a `control` function which takes two arguments:
a string-identifier `id` and an `open` ref. The `id` is used as an identifier to track single refs when new ones are added or
old ones are removed.

The accordion can be seen as the puppet master over all the boolean refs it controls. It allows only one ref to hold the value `true`
at a time. When one ref changes to `true` it will set all other refs to false.

## Collapse Controller

Using `useAccordion` also `provide()`s the `control` function as a `collapseController` meaning any collapse components or composables in the tree below which use `controlled: true` will be automatically controlled by this accordion.

## Contents

[[toc]]

## Types

```ts
interface AccordionOptions {
  provide?: boolean
  value?: MaybeRef<Record<string, boolean>>
}

function useAccordion(options?: AccordionOptions): (id: string, open: Ref<boolean>) => () => void;
```

## Examples

::: details
```vue
<script setup>
import { ref } from 'vue';
import { useAccordion } from '@teamnovu/kit-composables';

const control = useAccordion();

const bool1 = ref(false);
const bool2 = ref(true);
const bool3 = ref(false);
const bool4 = ref(true);

control("id1", bool1);
control("id2", bool2);
control("id3", bool3);
control("id4", bool4);
</script>

<button class="medium brand" @click="bool1 = !bool1">Swap</button> Bool1: {{ bool1 }}

<button class="medium brand" @click="bool2 = !bool2">Swap</button> Bool2: {{ bool2 }}

<button class="medium brand" @click="bool3 = !bool3">Swap</button> Bool3: {{ bool3 }}

<button class="medium brand" @click="bool4 = !bool4">Swap</button> Bool4: {{ bool4 }}
```
:::

<script setup>
import { ref } from 'vue';
import { useAccordion } from '@teamnovu/kit-composables';

const control = useAccordion();

const bool1 = ref(false);
const bool2 = ref(true);
const bool3 = ref(false);
const bool4 = ref(true);

control("id1", bool1);
control("id2", bool2);
control("id3", bool3);
control("id4", bool4);
</script>

<button class="medium brand" @click="bool1 = !bool1">Swap</button> Bool1: {{ bool1 }}

<button class="medium brand" @click="bool2 = !bool2">Swap</button> Bool2: {{ bool2 }}

<button class="medium brand" @click="bool3 = !bool3">Swap</button> Bool3: {{ bool3 }}

<button class="medium brand" @click="bool4 = !bool4">Swap</button> Bool4: {{ bool4 }}