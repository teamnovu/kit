<script lang="ts" setup>
import { ref } from 'vue';
import { Dialog } from '@teamnovu/kit-components';

const show = ref(false);
</script>

# The Dialog component

A component wrapping the functionality of a `<dialog>` element.

## Contents

[[toc]]

## Props

```ts
interface Props {
  modal?: boolean;
  alert?: boolean;
  show?: boolean;
  animationDuration?: number;
  animationType?: AnimationTypes;
}
```

## Examples


### Simple usage

::: details Code
```vue
<style lang="scss">
.fade-enter-active,
.fade-leave-active,
.fade-enter-active::backdrop,
.fade-leave-active::backdrop {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to,
.fade-enter-from::backdrop,
.fade-leave-to::backdrop {
  opacity: 0;
}
</style>

<style lang="scss" module>
.dialog {
  border: 1px solid var(--vp-custom-block-details-border);
  border-radius: .5rem;
  background: var(--vp-custom-block-details-border);
  max-width: 80%;
  padding-right: 4rem;
  display: block;
}

.dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 1.5rem;
  height: 1.5rem;
  white-space: wrap;
  
  &::after {
    content: "X";
    transform: scaleY(0.8);
    display: block;
  }
  
  &::before {
    content: "";
    display: flex;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    justify-content: center;
    align-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    border: 1px solid var(--vp-custom-block-details-border);
    background: var(--vp-custom-block-details-bg);
    z-index: -1;
  }
}
</style>


<button class="brand medium" @click="show = true">
  Show Dialog
</button>

<Transition name="fade">
  <Dialog v-model:show="show" v-slot="{ close }" :class="$style.dialog" modal>
    <button @click="close" :class="$style.close" />
    <p>
  Nostrud est dolor adipisicing occaecat. Cillum minim ad culpa consectetur occaecat irure proident. Minim exercitation duis voluptate minim officia elit sunt sit in in. Occaecat veniam deserunt deserunt est adipisicing ex qui exercitation proident laborum duis irure fugiat. Occaecat dolore exercitation eu reprehenderit qui ex et eu.

  Adipisicing occaecat ut amet ipsum cillum enim eiusmod occaecat aliquip. Exercitation laboris dolore ut excepteur aliqua aute sit mollit commodo magna aliquip in officia consequat. Cillum id sit minim sunt ad. Cillum adipisicing aliqua voluptate qui veniam eiusmod aute consectetur reprehenderit et dolore. Tempor eiusmod laboris fugiat deserunt dolor sunt est ut consectetur ad adipisicing eiusmod. Qui est laboris in esse proident proident. Laboris anim tempor culpa occaecat pariatur velit.

  Laboris consequat laborum velit veniam dolore sit eiusmod laborum irure exercitation proident. Qui veniam ex anim nisi duis occaecat incididunt Lorem. Fugiat veniam consectetur adipisicing aliquip fugiat proident minim nostrud do nisi veniam. Do id aliquip aliqua mollit laboris sunt ea esse quis. Cupidatat veniam quis magna ea aute et eu nostrud commodo ipsum voluptate.
    </p>
  </Dialog>
</Transition>
```
:::
<style lang="scss">
.fade-enter-active,
.fade-leave-active,
.fade-enter-active::backdrop,
.fade-leave-active::backdrop {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to,
.fade-enter-from::backdrop,
.fade-leave-to::backdrop {
  opacity: 0;
}

</style>
<style lang="scss" module>
.dialog {
  border: 1px solid var(--vp-custom-block-details-border);
  border-radius: .5rem;
  background: var(--vp-custom-block-details-border);
  max-width: 80%;
  padding-right: 4rem;
  display: block;
}

.dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 1.5rem;
  height: 1.5rem;
  white-space: wrap;
  
  &::after {
    content: "X";
    transform: scaleY(0.8);
    display: block;
  }
  
  &::before {
    content: "";
    display: flex;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    justify-content: center;
    align-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    border: 1px solid var(--vp-custom-block-details-border);
    background: var(--vp-custom-block-details-bg);
    z-index: -1;
  }
}
</style>


<button class="brand medium" @click="show = true">
  Show Dialog
</button>

<Transition name="fade">
  <Dialog v-model:show="show" v-slot="{ close }" :class="$style.dialog" modal>
    <button @click="close" :class="$style.close" />
    <p>
  Nostrud est dolor adipisicing occaecat. Cillum minim ad culpa consectetur occaecat irure proident. Minim exercitation duis voluptate minim officia elit sunt sit in in. Occaecat veniam deserunt deserunt est adipisicing ex qui exercitation proident laborum duis irure fugiat. Occaecat dolore exercitation eu reprehenderit qui ex et eu.

  Adipisicing occaecat ut amet ipsum cillum enim eiusmod occaecat aliquip. Exercitation laboris dolore ut excepteur aliqua aute sit mollit commodo magna aliquip in officia consequat. Cillum id sit minim sunt ad. Cillum adipisicing aliqua voluptate qui veniam eiusmod aute consectetur reprehenderit et dolore. Tempor eiusmod laboris fugiat deserunt dolor sunt est ut consectetur ad adipisicing eiusmod. Qui est laboris in esse proident proident. Laboris anim tempor culpa occaecat pariatur velit.

  Laboris consequat laborum velit veniam dolore sit eiusmod laborum irure exercitation proident. Qui veniam ex anim nisi duis occaecat incididunt Lorem. Fugiat veniam consectetur adipisicing aliquip fugiat proident minim nostrud do nisi veniam. Do id aliquip aliqua mollit laboris sunt ea esse quis. Cupidatat veniam quis magna ea aute et eu nostrud commodo ipsum voluptate.
    </p>
  </Dialog>
</Transition>