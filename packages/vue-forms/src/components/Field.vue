<template>
  <slot v-bind="slotData" />
</template>

<script
  setup lang="ts"
  generic="TData extends object, TPath extends Paths<TData>, TDataOut = TData"
>
import {
  computed,
  effectScope,
  nextTick,
  onScopeDispose,
  reactive,
  shallowRef,
  watch,
  type EffectScope,
} from 'vue'
import type { Form, FormField } from '../types/form.ts'
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

interface FieldBinding {
  field: FormField<PickProps<TData, TPath>, TPath>
  scope: EffectScope
}

let releasedScopes: EffectScope[] = []

const bind = (form: Form<TData, TDataOut>, path: TPath): FieldBinding => {
  const scope = effectScope()
  const field = scope.run(() => form.defineField({ path }))!

  return {
    field,
    scope,
  }
}

const stopReleasedScopes = () => {
  releasedScopes.forEach(scope => scope.stop())
  releasedScopes = []
}

// Released bindings are stopped after the render pass: on an array shift the row that now owns the old
// path tracks it first, so keepValuesOnUnmount: false only resets paths nobody holds anymore.
const release = (previous: FieldBinding) => {
  releasedScopes.push(previous.scope)
  nextTick(stopReleasedScopes)
}

const binding = shallowRef(bind(props.form, props.path))

watch(
  () => [props.form, props.path] as const,
  ([form, path]) => {
    release(binding.value)
    binding.value = bind(form, path)
  },
  { flush: 'sync' },
)

onScopeDispose(() => {
  binding.value.scope.stop()
  stopReleasedScopes()
})

const slotData = computed(() => reactive(binding.value.field))
</script>
