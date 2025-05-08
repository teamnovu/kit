<template>
  <slot />
</template>

<script setup lang="ts">
import { useAccordion } from '@teamnovu/kit-composables'

// #region Definitions

useAccordion({ provide: true })

// #endregion
</script>
