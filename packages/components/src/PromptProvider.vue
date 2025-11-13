<template>
  <slot v-bind="usePromptSlotProps" />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { usePromptProvider } from '@teamnovu/kit-composables'

const usePromptSlotProps = reactive(usePromptProvider())
</script>
