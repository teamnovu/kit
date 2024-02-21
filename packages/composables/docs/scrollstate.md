# ScrollState

A simple scroll state composable.

## Contents

[[toc]]

## Types

```ts
interface ScrollStateOptions {
    scrollThreshold?: number
    topThreshold?: number
}
interface ScrollState {
    beginning: Ref<boolean>
    downward: Ref<boolean>
    y: Ref<number>
}
```

## Options

| Prop | Default | Description |
| ---- |  -----  | ----------- |
| scrollThreshold | `50` | How many px to scroll befor a state change |
| topThreshold | `0` | How tall is the navigation |

## Examples

::: details
```vue
<script setup>
import { useScrollState } from "@teamnovu/kit-composables";

const { downward } = useScrollState({ scrollThreshold: 0 })
</script>

Scrolling {{ downward ? '⬇️ down' : '⬆️ up' }}
```
:::

<script setup>
import { useScrollState } from "@teamnovu/kit-composables";

const { downward } = useScrollState({ scrollThreshold: 0 })
</script>

Scrolling {{ downward ? '⬇️ down' : '⬆️ up' }}
