<template>
  <Field
    v-slot="{ errors, data, setData }"
    :form="form"
    :path="path"
  >
    <component
      :is="component"
      v-bind="{...componentProps, ...$attrs}"
      :model-value="data"
      :errors="errors"
      :name="path"
      @update:model-value="setData"
    >
      <slot />
    </component>
  </Field>
</template>

<script
  setup
  lang="ts"
  generic="TData extends object, TPath extends Paths<TData>, TComponent extends Component"
>
import { type Component } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'
import type { Paths } from '../types/util.ts'
import type { Form } from '../types/form.ts'

export interface FormFieldWrapperProps<TData extends object, TPath extends string, TComponent> {
  component: TComponent
  componentProps: Omit<ComponentProps<TComponent>, 'modelValue' | 'update:modelValue' | 'errors'>
  form: Form<TData>
  path: TPath
}

defineOptions({
  inheritAttrs: false,
})

defineProps<FormFieldWrapperProps<TData, TPath, TComponent>>()
</script>
