# Reference
## Composable `useForm`
This is the main composable which creates the form. It has the following signature:
```typescript
function useForm<T extends object, TOut = T>(options: {
  // the initial data of the form
  // reactive changes to this object will propagate to the form data
  initialData: MaybeRefOrGetter<T>
  // an ErrorBag object or ref of an ErrorBag object with external errors
  // this is used e.g. for server side validation errors
  // these errors will be merged with the internal errors of the form based on validateFn below and/or the zod schema
  errors?: MaybeRef<ErrorBag | undefined>
  // a zod schema of the form data
  // this is validated based on the validation flags or by manually triggering validateForm on the form object
  // TOut is inferred from the schema's output type if provided
  schema?: MaybeRef<z.ZodType<TOut>>
  // a custom validation function which is called with the current form data
  // this is additional to the schema for custom validations
  validateFn?: MaybeRef<ValidationFunction<T, TOut>>
  // if the form data of a property should be reset or kept if all fields corresponding to this property are unmounted
  // defaults to true
  keepValuesOnUnmount?: MaybeRef<boolean>
  // validation flags before first submit (defaults: validateOnSubmit: true, all others: false)
  validationBeforeSubmit?: ValidationFlags
  // validation flags after first submit (defaults: validateOnSubmit: true, validateOnDataChange: true, validateOnFieldRegister: true)
  validationAfterSubmit?: ValidationFlags
}): Form<T, TOut>
```
This composable returns a `Form<T, TOut>` object.

## Type `ValidationFlags`
Controls when validation is triggered:
```typescript
interface ValidationFlags {
  validateOnBlur?: MaybeRefOrGetter<boolean>
  validateOnFormOpen?: MaybeRefOrGetter<boolean>
  validateOnSubmit?: MaybeRefOrGetter<boolean>
  validateOnDataChange?: MaybeRefOrGetter<boolean>
  validateOnFieldRegister?: MaybeRefOrGetter<boolean>
}
```

## Type `Form<T, TOut>`
Here, `T` is the type of the form data, which is inferred from the `initialData` property of the options object passed to `useForm`.
`TOut` is the output type after validation/transformation. When a zod schema is provided, `TOut` is a merge of `T` with the schema's output type,
where the schema type takes precedence for properties it defines, and `T` provides types for properties unknown to the schema.
You can also explicitly provide a type argument to `useForm<T>` if needed (useful if the initial data is an empty object `{}`).

This object has the following properties and methods:
```typescript
interface Form<T extends object, TOut = T> {
  // the current working data of the form
  // this might differ from initialData if the user has changed some values
  data: Ref<T>
  // the initial data of the form as passed to useForm
  initialData: Readonly<Ref<T>>

  // all fields of the form that are currently managed
  fields: Ref<FieldsTuple<T>>

  // defines a field such that it will be managed by the form
  // without this, the form will not track changes, touched state or validation for this field
  // use this like a composable
  defineField: <P extends Paths<T>>(options: DefineFieldOptions<PickProps<T, P>, P>) => FormField<PickProps<T, P>, P>
  // gets an already defined field by its path
  // note: if the field was not yet defined, it will be defined automatically
  // the output is a reactive object containing the data, errors and states as well as some methods
  // use this like a composable
  getField: <P extends Paths<T>>(path: P) => FormField<PickProps<T, P>, P>

  // true if the form has been modified from its initial state
  isDirty: Ref<boolean>
  // true if any field of the form has been touched (i.e. onBlur was called on any field)
  isTouched: Ref<boolean>
  // true if the form data is valid based on the schema and/or the validateFn
  isValid: Ref<boolean>
  // true if the form has been validated at least once
  isValidated: Ref<boolean>
  // the ErrorBag object containing all errors of the form
  // this is a merge of internal errors based on schema/validateFn and external errors passed to useForm
  // the errors are structured based on the paths of the form fields
  errors: Ref<ErrorBag>

  // defines a custom validator for the form
  // with this, a subcomponent might add a validator function and/or schema to the form
  // without needing access to the initial useForm call
  defineValidator: <TData extends T, TDataOut extends TOut>(
    options: ValidatorOptions<TData, TDataOut> | Ref<Validator<TData, TDataOut>>
  ) => Ref<Validator<TData, TDataOut> | undefined>

  // resets the form data and errors, as well as the dirty, touched etc. state of all fields
  reset: () => void
  // manually triggers validation of the form data based on schema and/or validateFn
  // returns the validation result with errors and parsed data (if valid)
  validateForm: () => Promise<ValidationResult<TOut>>

  // creates a submit handler that validates the form before calling onSubmit
  // onSubmit receives the validated/transformed data (TOut)
  submitHandler: (onSubmit: (data: TOut) => Awaitable<void>) => (event: SubmitEvent) => Promise<void>

  // creates a subform for a nested object or array property of the form data
  // the subform is again a Form object, where T is the type of the nested property
  // it will contain all errors that have paths starting with the path of the subform
  // changes to the subform data will propagate to the main form data and vice versa
  getSubForm: <P extends EntityPaths<T>>(
      path: P,
      options?: SubformOptions<PickEntity<T, P>>,
  ) => Form<PickEntity<T, P>>

  // creates a field array for managing dynamic lists
  // see the Field Arrays section below for details
  getFieldArray: <K extends Paths<T>>(
    path: PickProps<T, K> extends unknown[] ? K : never,
    options?: FieldArrayOptions<PickProps<T, K> extends (infer U)[] ? U : never>,
  ) => FieldArray<PickProps<T, K> extends (infer U)[] ? U : never, K>
}
```

## Type `ErrorBag`
The errors in the form are structured in an `ErrorBag` object. Most errors are tied to properties in the form. However,
there might be cases where there are errors, that cannot be tied to one property. To account for that the `ErrorBag` satisfies the following interface:
```typescript
interface ErrorBag {
  // an array of general error messages not tied to a specific property
  general: string[] | undefined
  // a record of property paths to arrays of error messages
  // nested properties are dot-separated and array indices are just numbers, e.g. "person.address.street" or "person.hobbies.0.name"
  // for subforms the errors will be all errors that start with the path of the subform
  propertyErrors: Record<string, ValidationErrorMessage[] | undefined>
}
```

## Field Arrays
For managing dynamic lists (add, remove, reorder items), use `getFieldArray`. It provides stable IDs for each item,
which is important for efficient Vue rendering with `v-for`.

```typescript
const hobbies = form.getFieldArray('person.hobbies')

// add item
hobbies.push('new hobby')

// remove by id
hobbies.remove(hobbies.items.value[0].id)
```
```vue
<div v-for="field in hobbies.items.value" :key="field.id">
  <FormTextField :form="form" :path="field.path" />
  <button @click="hobbies.remove(field.id)">Remove</button>
</div>
```

For objects where identity should be based on a property (e.g. `id`) rather than reference equality, provide a `hashFn`:
```typescript
const products = form.getFieldArray('products', {
  hashFn: (item) => item.id
})
```

## Component `FormPart`
A component to define a subform part for a nested object or array property of the form data. This corresponds to the
`getSubForm` method of the `Form<T>` object, but in component form to be easily used in the template. An example usage is as follows:
```vue
<template>
  <FormPart :form="form" path="person.address" #="{ subform }">
    <MyAdddressComponent :form="subform" />
  </FormPart>
</template>
```
Here, the `subform` will be a `Form` object with the type of the `address` property of the `person` object of the main form data.
Note that the errors of the subform will only contain the errors that start with the path of the subform.

## Component `Field`
This is a helper component to access form fields. It corresponds to the `defineField` method of the `Form<T>` object,
but in component form to be easily used in the template.

An example usage is as follows:
```vue
<template>
    <Field :form="form" path="firstName" #="{ data, setData, onBlur, errors }">
        <input :value="data" @input="setData" @blur="onBlur" />
        <div v-if="errors.length > 0">
            <span v-for="error in errors" :key="error">{{ error }}</span>
        </div>
    </Field>
</template>
```

Note: it is recommended to use the `FormFieldWrapper` component and create a reusable form input component instead.

## Component `FormFieldWrapper`
This component is a helper component to easily create form input components based on plain input components.
See the [FormInput Example](./FormInput-example.md) for details and an example implementation of a form input component.
