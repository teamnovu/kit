<template>
  <component :is="is" :role="computedRole">
    <slot /> 
  </component>
</template>

<script lang="ts" setup>
import { computed, type HTMLAttributes } from 'vue';

interface Props {
  is: any;
  omitRoleFor?: ((is: any) => boolean) | string[];
  role: HTMLAttributes['role'];
}

const props = defineProps<Props>();

const computedRole = computed(() => {
  if (!props.omitRoleFor) return props.role;
  const omit =
    typeof props.omitRoleFor === 'function'
      ? props.omitRoleFor(props.is)
      : props.omitRoleFor.includes(props.is);

  if (omit) return undefined;
  return props.role;
});
</script>
