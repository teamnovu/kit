# Example

The following example shows how to use this library for a more complicated form with nested objects and arrays.
The data structure of the form is as follows:
```typescript
{
  person: {
    firstName: string,
    lastName: string | undefined,
    address: {
      street: string,
      city: string,
    },
    hobbies: string[]
  }
}
```

We can create a form like this:

```vue
<template>
  <form @submit="form.submitHandler(sendToBackend)">
    <!-- Simple form inputs -->
    <!-- the "label" prop is passed through the FormTextField to the underlying TextField -->
    <FormTextField
        :form="form"
        path="person.firstName"
        label="First Name"
    />
    <FormTextField
        :form="form"
        path="person.lastName"
        label="Last Name"
    />

    <!-- Oh oh, my path was wrong here, the form type does not have a property "person.middleName" -->
    <!-- I get a typescript error that this path is not allowed
    <FormTextField
      :form="form"
      path="person.middleName"
    />
    -->
    <!-- Oh oh, I used a Text component (which allows "string | number | null | undefined"), but the property at the path is a boolean  -->
    <!-- I get a typescript error that this path and form combination is not allowed
    <FormTextField
      :form="form"
      path="person.isMale"
    />
    -->

    <!-- Nested forms in subcomponents -->
    <!-- My FormAddressField handles forms of type { street: string, city: string } -->
    <!-- so we can make a subform for the address property of our main form -->
    <FormPart :form="form" path="person.address" #="{ subform }">
      <FormAddressField :form="subform" />
    </FormPart>

    <!-- Using getFieldArray for dynamic lists with add/remove functionality -->
    <div v-for="field in hobbies.items.value" :key="field.id" class="ml-4">
      <FormTextField
          :form="form"
          :path="field.path"
      />
      <button type="button" @click="hobbies.remove(field.id)">Remove</button>
    </div>
    <button type="button" @click="hobbies.push('')">Add Hobby</button>

    <button type="button" @click="toggleComment">
      Toggle Comment
    </button>

    <!-- If you need other data, use the data ref of the form object; don't use getField here -->
    <!-- Alternatively, in this case you could use the variable "isCommentEnabled" that was defined in the script setup -->
    <FormTextField
        v-if="unref(form.data).commentEnabled"
        :form="form"
        path="comment"
    />

    <!-- This is a one-off special thing; I don't really want to make a FormInput out of it -->
    <!-- I can use the Field component, or I could use form.getField in the script setup -->
    <Field v-slot="{ data, setData, errors }" path="person.parent" :form="form">
      <div>
        Father: {{ data.fatherName }}
      </div>
      <div>
        Mother: {{ data.motherName }}
      </div>
      <!-- the "errors" will be an array of strings of the errors corresponding to the property with the given path (here "person.parent") -->
      <InputError :errors="errors" />
      <button type="button" @click="() => setData({ fatherName: 'New Father', motherName: 'New Mother' })">
        Change Parent Names
      </button>
    </Field>

    <button type="submit">
      Submit Form
    </button>
    
  </form>
</template>

<script setup lang="ts">
import { Field, useForm, FormPart } from '@teamnovu/kit-vue-forms';
import { z } from 'zod';
import { unref } from 'vue';
import FormTextField from '#components/utils/form/formInput/FormTextField.vue';
import FormAddressField from '#/FormAddressField.vue';
import InputError from '#components/utils/form/InputError.vue';

const form = useForm<{ // this type might be inferred automatically from the initialData; but here, it would not work, because lastName is not defined in the initialData
  person: {
    firstName: string
    lastName?: string | undefined
    address: {
      street: string
      city: string
    }
    hobbies: string[]
    parent: {
      fatherName: string
      motherName: string
    }
    isMale: boolean
  }
  commentEnabled?: boolean
  comment: string
}>({
  initialData: {
    person: {
      firstName: '',
      // I don't need to define an initial value for lastName here, because it's optional; the form will still handle it correctly
      address: {
        street: '',
        city: '',
      },
      hobbies: ['cooking', 'coding'],
      parent: {
        fatherName: 'Hans Müller',
        motherName: 'Hannah Schmidt',
      },
      isMale: false
    },
    commentEnabled: false,
    comment: '',
  },
  // optional zod schema for validation; might also just define part of the schema if other properties should be ignored
  schema: z.object({
    person: z.object({
      hobbies: z.array(z.string().min(1, 'Hobby cannot be empty')),
    }),
  }),
});

// getFieldArray for managing the hobbies list
const hobbies = form.getFieldArray('person.hobbies');

const sendToBackend = async (data) => {
  // send validated data object to backend
  // note: data is the validated/transformed output type (TOut)
};

// To programmatically change form values, use form.getField to get a ref and a setter function
// never modify form.data directly
const { data: isCommentEnabled, setData: setCommentEnabled } = form.getField('commentEnabled');
const toggleComment = () => {
  setCommentEnabled(!unref(isCommentEnabled));
};
</script>

```

An example of the `FormAddressField` that was used above would be:
```vue
<!-- FormAddressField.vue -->
<template>
  <div>
    <FormTextField
      :form="form"
      path="street"
      label="Street Address"
    />

    <FormTextField
      :form="form"
      path="city"
      label="City"
    />
  </div>
</template>

<script setup lang="ts">
import type { Form } from '@teamnovu/kit-vue-forms';
import FormTextField from '#components/utils/form/formInput/FormTextField.vue';

interface Props {
  form: Form<{
    street: string
    city: string
  }>
}

defineProps<Props>();
</script>
```
