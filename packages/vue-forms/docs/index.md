# @teamnovu/kit-vue-forms

A library for data and error handling of forms, including validation with zod schemas.

## Installation

```bash
pnpm add @teamnovu/kit-vue-forms
```

## Purpose
This package provides composables and some data components to simplify the data management of forms and associated errors.
It was designed as a replacement of Vee-Validate with more flexibility and full type safety.

## Usage

1. Wrap your plain input components into `FormFieldWrapper`, see [FormInput Example](./FormInput-example.md).
2. Inside your parent component where you want to use a form, use the composable `useForm` to create a form object. 
This object contains the form data, errors, and methods to define
fields, validate the form, reset it, and create subforms for nested objects or arrays, see [here](./reference#composable-useform).
3. Pass this form object to any form input component together with a path to the property of the form data that this input
should manage. You can also make subforms, pass the form down to child components, etc. See the examples for inspiration.

An example of the most common usages can be found [here](./example.md).
