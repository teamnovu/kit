<template>
  <slot v-bind="{ subform }" />
</template>

<script
  setup
  lang="ts"
  generic="TData extends object, TPath extends EntityPaths<TData>, TDataOut = TData"
>
import { computed } from 'vue'
import type { Form } from '../types/form.ts'
import type { EntityPaths } from '../types/util.ts'

export interface FormPartProps<TData extends object, TPath, TDataOut = TData> {
  form: Form<TData, TDataOut>
  path: TPath
}

const props = defineProps<FormPartProps<TData, TPath, TDataOut>>()

const subform = computed(() => props.form.getSubForm(props.path))
</script>
