# PromptProvider component

A component that provides prompt functionality to its child components which is used in conjunction with the `usePrompt` composable.

## Contents

[[toc]]

## Slot Props

```ts
interface PromptProviderSlotProps {
  isOpen: boolean
  resolve:  (value: PromptAnswer) => void
  promptOptions: PromptInvokeOptions | undefined
}
```

Note that `PromptInvokeOptions` and `PromptAnswer` are the same types as defined in the prompt documentation of the
composable package and they can be fully customized as discussed there.

## Examples

```vue
<PromptProvider v-slot="{ isOpen, resolve, promptOptions }">
  <Modal :model-value="isOpen" :title="promptOptions?.title ?? 'Default Title'">
    <p>{{ promptOptions?.message ?? 'Default Message' }}</p>
    <button type="button" @click="resolve({ ok: false })">
      {{ promptOptions?.cancelButtonText ?? 'No' }}
    </button>
    <button type="button" @click="resolve({ ok: true })">
      {{ promptOptions?.confirmButtonText ?? 'Yes' }}
    </button>
  </Modal>
  <RouterView />
</PromptProvider>
```
