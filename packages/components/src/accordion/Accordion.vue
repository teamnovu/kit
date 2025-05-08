<template>
  <AccessibleComponent :is="is" :omit-role-for="['ul', 'ol', 'menu']" role="list">
    <HAccordion>
      <slot />
    </HAccordion>
  </AccessibleComponent>
</template>

<script setup lang="ts">
import HAccordion from './HAccordion.vue'
import AccessibleComponent from '../AccessibleComponent.vue'

interface Props {
  is: any
}

// #region Definitions

withDefaults(defineProps<Props>(), {
  is: 'section',
})

// #endregion
</script>
