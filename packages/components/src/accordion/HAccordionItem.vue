<template>
  <Collapse v-slot="collapseProps" v-bind="props" v-model:open="isOpen">
    <slot v-bind="collapseProps" />
  </Collapse>
</template>

<script setup lang="ts">
import type { CubicBezierPoints, EasingFunction } from '@vueuse/core'
import type { MaybeRef } from '@vueuse/shared'
import Collapse from '../Collapse.vue'
import { useVModel } from '@vueuse/core'

// #region Types

interface Props {
  id?: string
  open?: boolean
  dimension?: 'width' | 'height'
  duration?: number
  transition?: MaybeRef<EasingFunction | CubicBezierPoints>
  initiallyClosed?: boolean
  controlled?: boolean
}

// #endregion

// #region Definitions

const emit = defineEmits(['update:open'])
const props = withDefaults(defineProps<Props>(), {
  initiallyClosed: true,
  controlled: true,
  open: undefined,
})

const isOpen = useVModel(props, 'open', emit, {
  passive: true,
  defaultValue: !props.initiallyClosed,
})

// #endregion
</script>
