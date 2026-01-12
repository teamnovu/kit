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

      <!-- https://vue-land.github.io/faq/forwarding-slots#passing-all-slots -->
      <template
        v-for="(_, slotName) in $slots"
        #[slotName]="slotProps"
      >
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </component>
  </Field>
</template>

<script
  setup
  lang="ts"
  generic="
    TData extends FormDataDefault,
    TPath extends Paths<TData>,
    TComponent extends Component,
    TDataOut = TData
  "
>
import { type Component } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'
import type { Paths } from '../types/util.ts'
import type { Form, FormDataDefault } from '../types/form.ts'

export interface FormFieldWrapperProps<
  TData extends FormDataDefault,
  TPath extends string,
  TComponent,
  TDataOut = TData,
> {
  component: TComponent
  componentProps: Omit<ComponentProps<TComponent>, 'modelValue' | 'update:modelValue' | 'errors'>
  form: Form<TData, TDataOut>
  path: TPath
}

defineOptions({
  inheritAttrs: false,
})

defineProps<FormFieldWrapperProps<TData, TPath, TComponent, TDataOut>>()
</script>
