<template>
  <slot
    :ref="updateRef"
    :open="handleOpen"
    :close="handleClose"
    :toggle="toggle"
    :is-open="isOpen"
    :is-transitioning="isTransitioning"
  />
</template>

<script setup lang="ts">
import { ref, unref } from 'vue'
import { omit } from 'lodash-es'
import { useCollapse } from '@teamnovu/kit-composables'
import {
  syncRef,
  useVModel,
  type CubicBezierPoints,
  type EasingFunction,
  type MaybeRef,
} from '@vueuse/core'
import { nanoid } from 'nanoid'

// #region Types

interface Props {
  open?: boolean
  dimension?: 'width' | 'height'
  duration?: number
  transition?: MaybeRef<EasingFunction | CubicBezierPoints>
  initiallyClosed?: boolean
  controlled?: boolean
}

// #endregion

// #region Definitions

const props = defineProps<Props>()
const emit = defineEmits(['update:open'])

const collapseRef = ref<HTMLElement>()
const isTransitioning = ref(false)
const id = nanoid()
const isOpen = useCollapse(collapseRef, {
  ...omit(props, ['open']),
  id,
  provide: true,
  initiallyClosed:
    props.open === undefined ? props.initiallyClosed : !props.open,
  onStarted: () => {
    isTransitioning.value = true
  },
  onFinished: () => {
    isTransitioning.value = false
  },
})

const model = useVModel(props, 'open', emit, { passive: true })

syncRef(isOpen, model)

// #endregion

// #region Methods

const updateRef = (next: HTMLElement) => {
  collapseRef.value = next
}

const handleOpen = () => {
  isOpen.value = true
}

const handleClose = () => {
  isOpen.value = false
}

const toggle = () => {
  isOpen.value = !unref(isOpen)
}

// #endregion
</script>
