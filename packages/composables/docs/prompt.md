# Prompt

A utility to easily create confirmation prompts.
It is recommended to use the main composable `usePrompt` together with the `PromptProvider` component of the component package, but it is
also possible to use `usePromptProvider` directly instead of in component form.

## Contents

[[toc]]

## Types

The data you pass during prompt invocation and the data you receive as an answer are fully customizable, see [below](#type-customization).
The default types are as follows:

```ts
export interface PromptInvokeOptions {
  title?: string
  message?: string
  confirmButtonText?: string
  cancelButtonText?: string
}
export interface PromptAnswer {
  ok: boolean
}
```

The `PromptInvokeOptions` type defines the options you can pass when invoking a prompt, while the `PromptAnswer`
type defines the shape of the answer you receive when the prompt is resolved.

## Options

There are currently no options for neither `usePrompt`, nor `usePromptProvider`.

## Examples

#### Prompt usage
```vue
<template>
    <button type="button" @click="askForPermission">
      Delete Item
    </button>
</template>

<script setup lang="ts">
  const prompt = usePrompt()
  
  const askForPermission = async () => {
    const { ok } = prompt({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
    })
    if (ok) {
      // Proceed with deletion
    } else {
      // Cancellation logic
    }
  }
</script>
```

#### Prompt Provider component (alternatively use the `PromptProvider` component from the component package)
```vue
<template>
  <slot />
  <Modal :model-value="isOpen" :title="promptOptions?.title ?? 'Default Title'">
    <p>{{ promptOptions?.message ?? 'Default Message' }}</p>
    <button type="button" @click="resolve({ ok: false })">
      {{ promptOptions?.cancelButtonText ?? 'No' }}
    </button>
    <button type="button" @click="resolve({ ok: true })">
      {{ promptOptions?.confirmButtonText ?? 'Yes' }}
    </button>
  </Modal>
</template>

<script setup lang="ts">
  const {
    isOpen,
    promptOptions,
    resolve,
  } = usePromptProvider()
</script>
```

## Type Customization

Both interfaces in the [Types](#types) section can be customized by module augmentation. To do this, create a file
`global.d.ts` in your project with the following content:
```typescript
declare module '@teamnovu/kit-composables' {
  export interface PromptInvokeOptions {
    // define your custom properties here
    // note that the interface will NOT be merged with the default one
  }
  export interface PromptAnswer {
    // define your custom properties here
    // note that the interface will NOT be merged with the default one
  }
}

export {};
```
Note that if you want to use a different file name you might need to add it explicitly in the `tsconfig.json` file.
