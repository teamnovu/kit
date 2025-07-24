<template>
  <slot v-bind="field" />
</template>

<script
  setup lang="ts"
  generic="TData extends object, TPath extends Paths<TData>"
>
import type { Form } from '../types/form.ts'
import type { Paths, PickProps } from '../types/util.ts'
import type { UseFieldOptions } from '../composables/useField.ts'

export interface FieldProps<TData extends object, TPath extends string> extends UseFieldOptions<PickProps<TData, TPath>, TPath> {
  form: Form<TData>
}

const props = defineProps<FieldProps<TData, TPath>>()

const field = props.form.defineField({
  path: props.path,
  required: props.required,
})
</script>
