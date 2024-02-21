# ScrollState component <Badge type="tip" text="Headless" />

A simple scroll state component.

## Contents

[[toc]]

## Props

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

## Examples

::: details Code
```vue
<script setup>
import { HScrollState } from '@teamnovu/kit-components';
</script>

<HScrollState #default="{ downward }" :scroll-threshold='0'>
    <nav :style="{
        padding: downward.value ? '2rem 1rem' : '0.5rem 1rem',
        transition: '0.3s ease',
    }">
        <strong>Logo</strong> aaa bbb ccc
    </nav>
</HScrollState>
```
:::
<script setup>
import { HScrollState } from '@teamnovu/kit-components';
</script>

 <div :style="{ background: 'gray', height: '120px', overflow: 'hidden' }">
    <HScrollState #default="{ downward, y }" :scroll-threshold='10'>
        <nav :style="{
            color: 'black',
            padding: downward.value ? '2rem 1rem' : '0.5rem 1rem',
            background: downward.value ? 'white' : 'orange',
            transition: '0.3s ease',
        }">
            <strong>Logo</strong> aaa bbb ccc
        </nav>
    </HScrollState>
 </div>