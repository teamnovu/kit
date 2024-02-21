<template>
  <component
    :is="is"
    :id="toggleController?.id"
    :ref="toggleController?.ref"
  >
    <slot />
  </component>
</template>

<script lang="ts" setup>
import { useCollapseContext } from '@teamnovu/kit-composables';

// #region Definitions

interface Props {
  is?: any;
}

withDefaults(defineProps<Props>(), {
  is: 'section',
});

const toggleController = useCollapseContext();

// #endregion
</script>
