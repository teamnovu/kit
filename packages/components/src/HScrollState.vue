<template>
  <slot v-bind="scrollState" />
</template>

<script setup lang="ts">
import { useScrollState } from "@teamnovu/kit-composables";

const props = defineProps<{
    scrollThreshold?: number
    topThreshold?: number
}>()

const scrollState = useScrollState(props)
</script>
