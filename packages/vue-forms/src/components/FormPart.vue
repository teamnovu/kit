<template>
  <slot v-bind="{ subform }" />
</template>

<script
  setup
  lang="ts"
  generic="TData extends object, TPath extends EntityPaths<TData>"
>
import { computed } from 'vue'
import type { Form } from '../types/form.ts'
import type { EntityPaths } from '../types/util.ts'

export interface FormPartProps<TData extends object, TPath> {
  form: Form<TData>
  path: TPath
}

const props = defineProps<FormPartProps<TData, TPath>>()

const subform = computed(() => props.form.getSubForm(props.path))
</script>
