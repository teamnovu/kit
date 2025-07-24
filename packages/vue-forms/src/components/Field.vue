<template>
  <slot v-bind="field" />
</template>

<script
  setup lang="ts"
  generic="TPath extends Paths<TData>, TData extends object"
>
import type { Form } from '../types/form.ts'
import type { Paths, PickProps } from '../types/util.ts'
import type { UseFieldOptions } from '../composables/useField.ts'

export interface FieldProps<TPath extends string, TData extends object> extends UseFieldOptions<PickProps<TData, TPath>, TPath> {
  form: Form<TData>
}

const props = defineProps<FieldProps<TPath, TData>>()

const field = props.form.defineField({
  path: props.path,
  required: props.required,
})
</script>
