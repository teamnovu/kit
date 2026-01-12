<template>
  <slot v-bind="slotData" />
</template>

<script
  setup lang="ts"
  generic="TData extends object, TPath extends Paths<TData>, TDataOut = TData"
>
import { reactive } from 'vue'
import type { Form } from '../types/form.ts'
import type { Paths, PickProps } from '../types/util.ts'
import type { UseFieldOptions } from '../composables/useField.ts'

export interface FieldProps<
  TData extends object,
  TPath extends string,
  TDataOut = TData,
> extends UseFieldOptions<PickProps<TData, TPath>, TPath> {
  form: Form<TData, TDataOut>
}

const props = defineProps<FieldProps<TData, TPath, TDataOut>>()

const field = props.form.defineField({
  path: props.path,
})

const slotData = reactive(field)
</script>
