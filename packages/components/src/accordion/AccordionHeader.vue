<template>
  <AccessibleComponent
    :is="is"
    :omit-role-for="accessibleComponents"
    role="button"
    :aria-expanded="toggleController?.toggle?.value"
    :aria-pressed="toggleController?.toggle?.value"
    :aria-controls="toggleController?.id"
    tabindex="0"
    @click.prevent
    @click="toggle"
    @keydown="keydown"
  >
    <slot />
  </AccessibleComponent>
</template>

<script lang="ts" setup>
import { unref } from 'vue';
import AccessibleComponent from '../AccessibleComponent.vue';
import { useCollapseContext } from '@teamnovu/kit-composables';

// #region Definitions

interface Props {
  is?: any;
}

const props = withDefaults(defineProps<Props>(), {
  is: 'summary',
});

const toggleController = useCollapseContext();

const accessibleComponents = ['button', 'summary'];

// #endregion

// #region Methods

const toggle = () => {
  if (!toggleController) return;
  toggleController.toggle.value = !unref(toggleController.toggle);
};

const keydown = (e: KeyboardEvent) => {
  if (accessibleComponents.includes(props.is)) return;
  if (e.key === "Enter") {
    toggle();
  }
}

// #endregion
</script>
