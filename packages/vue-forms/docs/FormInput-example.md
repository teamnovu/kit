# FormInput Example

To define a form input component you need a plain input component that has at least the following props and emits:
```typescript
interface Props {
  modelValue: T
  errors?: string[] | undefined // if the input should display errors
}
interface Emits {
  'update:modelValue': [T]
}
```
Then we can easily use the `FormFieldWrapper` component from this package.

In the example below we use a text field `TextField.vue`.

Example:
```vue
<!-- FormTextInput.vue -->
<template>
  <FormFieldWrapper
    :component="TextField"
    :component-props="$props"
    :path="path"
    :form="form"
  />
</template>

<script setup lang="ts" generic="TData extends object, TPath extends Paths<TData>">
import type { TextFieldProps } from '#components/utils/form/plainInput/TextField.vue';
import TextField from '#components/utils/form/plainInput/TextField.vue';
import { type Paths, FormFieldWrapper } from '@teamnovu/kit-vue-forms';
import type {
  ExcludedFieldProps,
  FormComponentProps,
} from '#types/form/FormComponentProps';

export type Props<TData extends object, TPath extends Paths<TData>> =
  FormComponentProps<TData, TPath, TextFieldProps['modelValue']> & Omit<TextFieldProps, ExcludedFieldProps>;

defineProps<Props<TData, TPath>>();
</script>
```
Note the usage of the generic types `TData` and `TPath` to make the component fully type-safe. With this, the `path` prop
will only allow valid paths of the form data. Moreover, it will throw a type error if the property at `path` of the `form`
has the wrong type. This is ensured by using the `FormComponentProps` type above.

The usage of such a form input component is as follows (assuming the input should handle the "firstName" property of the form data):
```vue
<FormTextInput 
  :form="form"
  path="firstName"
/>
```
Here, `form` is the Form component that was created with [`useForm`](index.md#useform). All additional props are passed
to the underlying plain input component, e.g. `label`, `placeholder`, etc.

It is recommended to use this pattern of a styled "plain input" that works with v-model and a "form input" to work with form
and path as props for all your form inputs. Like that, you can easily use the plain component outside of forms as well.
