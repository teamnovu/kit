<template>
  <HAccordionItem
    v-slot="collapseProps"
    v-bind="omit(props, ['is'])"
    v-model:open="isOpen"
    :initially-closed="initiallyClosed"
  >
    <AccessibleComponent
      :is="is"
      :omit-role-for="['li']"
      role="listitem"
      :open="shouldShowOpenAttribute(collapseProps)"
      v-bind="$attrs"
    >
      <slot v-bind="collapseProps" />
    </AccessibleComponent>
  </HAccordionItem>
</template>

<script setup lang="ts">
import {
  useVModel,
  type CubicBezierPoints,
  type EasingFunction,
} from '@vueuse/core'
import type { MaybeRef } from '@vueuse/shared'
import HAccordionItem from './HAccordionItem.vue'
import AccessibleComponent from '../AccessibleComponent.vue'
import { omit } from 'lodash-es'

// #region Types

interface Props {
  is?: any
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
  is: 'details',
  initiallyClosed: true,
  controlled: true,
  open: undefined,
})

const isOpen = useVModel(props, 'open', emit, {
  passive: true,
  defaultValue: !props.initiallyClosed,
})

// #endregion

// #region Methods

type AccordionItemSlotProps = Parameters<
  NonNullable<InstanceType<typeof HAccordionItem>['$slots']['default']>
>[0]

const shouldShowOpenAttribute = (collapseProps: AccordionItemSlotProps) =>
  props.is === 'details'
    ? collapseProps.isTransitioning || collapseProps.isOpen
    : false

// #endregion
</script>
