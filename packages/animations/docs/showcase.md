<script lang="ts" setup>
 import { onMounted, onBeforeUnmount, ref, unref } from 'vue';
 import { create, createTimeline } from "@teamnovu/kit-animations"; 
 import "@teamnovu/kit-animations/style.css";
 import showcaseAnimations from "./showcase.module.scss";
 
 const container = ref();
 const container2 = ref();

 const { start, stop, instance } = create({
  threshold: 50,
  defaultAnimationOptions: {
    cssVars: {
      offset: '50px',
    }
  }
 });

 const { vAnimate, start: startGlobal, stop: stopGlobal } = create({
  threshold: 60,
  defaultAnimationOptions: {
    cssVars: {
      offset: '50px',
    }
  }
 });

 const timeline = createTimeline();
 
 onMounted(() => {
  start(unref(container));
  startGlobal();
 });
 
 onBeforeUnmount(() => {
  stop();
  stopGlobal();
 });
</script>

<style module>
.paragraph {
  margin: 2rem 0;
}

.card {
  width: 200px;
  height: 200px;
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid var(--vp-custom-block-details-border);
  border-radius: .5rem;
  background: var(--vp-custom-block-details-border);
}

.container {
  width: 200;
  height: 400px;
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid var(--vp-custom-block-details-border);
  border-radius: .5rem;
  background: var(--vp-custom-block-details-border);
  
  overflow: scroll;
}
</style>

<style module="animations">
.card {
  transition-property: transform;
  transition-duration: var(--jk-animation-card-duration);
  transition-delay: var(--jk-animation-card-delay);
  transition-timing-function: var(--jk-animation-card-easing);

  transform: rotate(0);
}

.card-in {
  transform: rotate(0);
}

.card-out-bottom {
  transform: rotate(45deg);
}

.card-out-top {
  transform: rotate(-45deg);
}
</style>


# Animations showcase

[[toc]]

## Usage in a container


### With a separate instance

If you start the animation instance with `start(scrollContainer)` only
the specified `scrollContainer` will be listened to.

If you have installed multiple instances (e.g. a global one listening on scroll changes of the window)
you will have to pass `{ instance }` to the single `v-animate` calls to specify which instance
your `v-animate` should register to. E.g. `v-animate:in-bottom={ instance }`.


::: details Code
```vue
<script setup>
 import { onMounted, onBeforeUnmount, ref, unref } from 'vue';
 import { create } from "@teamnovu/kit-animations";
 import "@teamnovu/kit-animations/style.css";
 
 const container = ref();
 const { vAnimate, start, stop, instance } = create({
  threshold: 50,
  defaultAnimationOptions: {
    cssVars: {
      offset: '50px',
    }
  }
 });
 
 onMounted(() => {
  // Explicitely declare the scroll container
  start(unref(container));
 });
 
 onBeforeUnmount(() => {
  stop();
 });
</script>

<div :class="$style.container" ref="container" v-animate:in-bottom>
  <div :class="$style.paragraph" v-animate:in-bottom="{ instance }">
    Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat. Nisi ad elit eu dolor dolore nostrud ex. Deserunt eiusmod enim labore id amet eu est adipisicing duis fugiat anim consectetur. Enim proident pariatur consectetur ad ipsum in laborum Lorem officia laboris eiusmod dolore nostrud. Excepteur ipsum labore adipisicing labore qui anim nisi do incididunt sunt. Velit dolore adipisicing laborum culpa est sint cupidatat ex laboris.
  </div>


  <div :class="$style.paragraph" v-animate:in-bottom="{ instance }">
  Excepteur id mollit proident do non reprehenderit ipsum et deserunt aliqua ullamco dolor ad. Do quis dolore nisi incididunt proident sint nulla. Enim exercitation non excepteur commodo enim amet magna aliqua anim anim. Nisi dolor nulla eiusmod occaecat minim elit voluptate esse. Eiusmod nostrud amet cupidatat ex id nostrud excepteur veniam irure ut sint. Sint consectetur proident tempor laboris laboris in. Aute non ipsum officia ex Lorem consectetur adipisicing ad.
  </div>

  <div :class="$style.paragraph" v-animate:in-bottom="{ instance }">
  Exercitation amet velit ad ullamco commodo consectetur non in consequat et. Dolor adipisicing proident et ea ut ipsum minim dolor qui nisi tempor commodo. Laboris do enim nisi do anim irure commodo ut irure exercitation. Voluptate consequat duis fugiat amet voluptate ea laborum occaecat voluptate. Culpa veniam ullamco excepteur minim elit elit cillum adipisicing officia.
  </div>
</div>
```
:::

<div :class="$style.container" ref="container" v-animate:in-bottom>
  <div :class="$style.paragraph" v-animate:in-bottom="{ instance }">
    Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat. Nisi ad elit eu dolor dolore nostrud ex. Deserunt eiusmod enim labore id amet eu est adipisicing duis fugiat anim consectetur. Enim proident pariatur consectetur ad ipsum in laborum Lorem officia laboris eiusmod dolore nostrud. Excepteur ipsum labore adipisicing labore qui anim nisi do incididunt sunt. Velit dolore adipisicing laborum culpa est sint cupidatat ex laboris.
  </div>


  <div :class="$style.paragraph" v-animate:in-bottom="{ instance }">
  Excepteur id mollit proident do non reprehenderit ipsum et deserunt aliqua ullamco dolor ad. Do quis dolore nisi incididunt proident sint nulla. Enim exercitation non excepteur commodo enim amet magna aliqua anim anim. Nisi dolor nulla eiusmod occaecat minim elit voluptate esse. Eiusmod nostrud amet cupidatat ex id nostrud excepteur veniam irure ut sint. Sint consectetur proident tempor laboris laboris in. Aute non ipsum officia ex Lorem consectetur adipisicing ad.
  </div>

  <div :class="$style.paragraph" v-animate:in-bottom="{ instance }">
  Exercitation amet velit ad ullamco commodo consectetur non in consequat et. Dolor adipisicing proident et ea ut ipsum minim dolor qui nisi tempor commodo. Laboris do enim nisi do anim irure commodo ut irure exercitation. Voluptate consequat duis fugiat amet voluptate ea laborum occaecat voluptate. Culpa veniam ullamco excepteur minim elit elit cillum adipisicing officia.
  </div>
</div>


### By using a single global instance but passing along a specific scrollContainer:

You have to pass `{ scrollContainer }` to your `v-animate`.


::: details Code
```vue
<script setup>
 import { onMounted, onBeforeUnmount, ref, unref } from 'vue';
 import { create } from "@teamnovu/kit-animations";
 import "@teamnovu/kit-animations/style.css";
 
 const container = ref();
 const { vAnimate, start, stop } = create({
  threshold: 60,
  defaultAnimationOptions: {
    cssVars: {
      offset: '50px',
    }
  }
 });
 
 onMounted(() => {
  // Listen globally on window scroll changes
  start();
 });
 
 onBeforeUnmount(() => {
  stop();
 });
</script>

<div :class="$style.container" ref="container" v-animate:in-bottom>
  <div :class="$style.paragraph" v-animate:in-bottom="{ scrollContainer: container }">
    Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat. Nisi ad elit eu dolor dolore nostrud ex. Deserunt eiusmod enim labore id amet eu est adipisicing duis fugiat anim consectetur. Enim proident pariatur consectetur ad ipsum in laborum Lorem officia laboris eiusmod dolore nostrud. Excepteur ipsum labore adipisicing labore qui anim nisi do incididunt sunt. Velit dolore adipisicing laborum culpa est sint cupidatat ex laboris.
  </div>


  <div :class="$style.paragraph" v-animate:in-bottom="{ scrollContainer: container }">
  Excepteur id mollit proident do non reprehenderit ipsum et deserunt aliqua ullamco dolor ad. Do quis dolore nisi incididunt proident sint nulla. Enim exercitation non excepteur commodo enim amet magna aliqua anim anim. Nisi dolor nulla eiusmod occaecat minim elit voluptate esse. Eiusmod nostrud amet cupidatat ex id nostrud excepteur veniam irure ut sint. Sint consectetur proident tempor laboris laboris in. Aute non ipsum officia ex Lorem consectetur adipisicing ad.
  </div>

  <div :class="$style.paragraph" v-animate:in-bottom="{ scrollContainer: container }">
  Exercitation amet velit ad ullamco commodo consectetur non in consequat et. Dolor adipisicing proident et ea ut ipsum minim dolor qui nisi tempor commodo. Laboris do enim nisi do anim irure commodo ut irure exercitation. Voluptate consequat duis fugiat amet voluptate ea laborum occaecat voluptate. Culpa veniam ullamco excepteur minim elit elit cillum adipisicing officia.
  </div>
</div>
```
:::

<div :class="$style.container" ref="container2" v-animate:in-bottom>
  <div :class="$style.paragraph" v-animate:in-left="{ scrollContainer: container2 }">
    Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat. Nisi ad elit eu dolor dolore nostrud ex. Deserunt eiusmod enim labore id amet eu est adipisicing duis fugiat anim consectetur. Enim proident pariatur consectetur ad ipsum in laborum Lorem officia laboris eiusmod dolore nostrud. Excepteur ipsum labore adipisicing labore qui anim nisi do incididunt sunt. Velit dolore adipisicing laborum culpa est sint cupidatat ex laboris.
  </div>

  <div :class="$style.paragraph" v-animate:in-left="{ scrollContainer: container2 }">
  Excepteur id mollit proident do non reprehenderit ipsum et deserunt aliqua ullamco dolor ad. Do quis dolore nisi incididunt proident sint nulla. Enim exercitation non excepteur commodo enim amet magna aliqua anim anim. Nisi dolor nulla eiusmod occaecat minim elit voluptate esse. Eiusmod nostrud amet cupidatat ex id nostrud excepteur veniam irure ut sint. Sint consectetur proident tempor laboris laboris in. Aute non ipsum officia ex Lorem consectetur adipisicing ad.
  </div>

  <div :class="$style.paragraph" v-animate:in-left="{ scrollContainer: container2 }">
  Exercitation amet velit ad ullamco commodo consectetur non in consequat et. Dolor adipisicing proident et ea ut ipsum minim dolor qui nisi tempor commodo. Laboris do enim nisi do anim irure commodo ut irure exercitation. Voluptate consequat duis fugiat amet voluptate ea laborum occaecat voluptate. Culpa veniam ullamco excepteur minim elit elit cillum adipisicing officia.
  </div>
</div>


## Default animations

### in-top

<div :class="$style.paragraph" v-animate:in-top>
  Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat. Nisi ad elit eu dolor dolore nostrud ex. Deserunt eiusmod enim labore id amet eu est adipisicing duis fugiat anim consectetur. Enim proident pariatur consectetur ad ipsum in laborum Lorem officia laboris eiusmod dolore nostrud. Excepteur ipsum labore adipisicing labore qui anim nisi do incididunt sunt. Velit dolore adipisicing laborum culpa est sint cupidatat ex laboris.
</div>

### in-bottom

<div :class="$style.paragraph" v-animate:in-bottom>
  Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat. Nisi ad elit eu dolor dolore nostrud ex. Deserunt eiusmod enim labore id amet eu est adipisicing duis fugiat anim consectetur. Enim proident pariatur consectetur ad ipsum in laborum Lorem officia laboris eiusmod dolore nostrud. Excepteur ipsum labore adipisicing labore qui anim nisi do incididunt sunt. Velit dolore adipisicing laborum culpa est sint cupidatat ex laboris.
</div>

### in-left

<div :class="$style.paragraph" v-animate:in-left>
  Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat. Nisi ad elit eu dolor dolore nostrud ex. Deserunt eiusmod enim labore id amet eu est adipisicing duis fugiat anim consectetur. Enim proident pariatur consectetur ad ipsum in laborum Lorem officia laboris eiusmod dolore nostrud. Excepteur ipsum labore adipisicing labore qui anim nisi do incididunt sunt. Velit dolore adipisicing laborum culpa est sint cupidatat ex laboris.
</div>

### in-right

<div :class="$style.paragraph" v-animate:in-right>
  Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat. Nisi ad elit eu dolor dolore nostrud ex. Deserunt eiusmod enim labore id amet eu est adipisicing duis fugiat anim consectetur. Enim proident pariatur consectetur ad ipsum in laborum Lorem officia laboris eiusmod dolore nostrud. Excepteur ipsum labore adipisicing labore qui anim nisi do incididunt sunt. Velit dolore adipisicing laborum culpa est sint cupidatat ex laboris.
</div>

### stagger


::: details stagger
```vue
<script setup>
 import { create, createTimeline } from "@teamnovu/kit-animations";

 const timeline = createTimeline();
</script>

<template>
  <div
    :class="$style.paragraph"
    v-animate:in-top="{ stagger: 150, target: '& .target', timeline }"
    v-animate:in-right="{ stagger: 150, target: '& .target-right', timeline, timelineOffset: '>-0.15' }">

    <div class="target">
      Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat.
    </div>

    <div class="target">
      Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat.
    </div>

    <div class="target">
      Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat.
    </div>

    <div class="target-right">
      Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat.
    </div>

    <div class="target-right">
      Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat.
    </div>
  </div>
</template>
```
::: 

<div
  :class="$style.paragraph"
  v-animate:in-top="{ stagger: 150, target: '& .target', timeline }"
  v-animate:in-right="{ stagger: 150, target: '& .target-right', timeline, timelineOffset: '>-0.15' }">

  <div class="target">
    Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat.
  </div>

  <div class="target">
    Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat.
  </div>

  <div class="target">
    Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat.
  </div>

  <div class="target-right">
    Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat.
  </div>

  <div class="target-right">
    Magna eu pariatur duis fugiat aliqua nulla consectetur fugiat sunt. Id quis ad dolor duis esse do cupidatat ea non excepteur amet occaecat.
  </div>
</div>

## Adding animations

### Directly in your component


::: details Code
```vue
<style module="animations">
.card {
  transition-property: transform;
  transition-duration: var(--jk-animation-card-duration);
  transition-delay: var(--jk-animation-card-delay);
  transition-timing-function: var(--jk-animation-card-easing);

  transform: rotate(0);
}

.card-in {
  transform: rotate(0);
}

.card-out-bottom {
  transform: rotate(45deg);
}

.card-out-top {
  transform: translate(-45deg);
}
</style>

<template>
  <div :class="$style.card" v-animate:card="{ classes: animations }" />
</template>
```
:::

<div :class="$style.card" v-animate:card="{ classes: animations }" />


### In a new css file


::: details showcase.module.scss
```vue
.card-pop {
  transition-property: transform;
  transition-duration: var(--jk-animation-card-duration);
  transition-delay: var(--jk-animation-card-delay);
  transition-timing-function: var(--jk-animation-card-easing);

  transform: scale(0);
}

.card-pop-in {
  transform: scale(0);
}

.card-pop-out {
  transform: scale(0.7);
}
```
:::

::: details MyComponent.vue
```vue
<script setup>
 import { onMounted, onBeforeUnmount, ref, unref } from 'vue';
 import { create } from "@teamnovu/kit-animations";
 import "@teamnovu/kit-animations/style.css";
 
 // Import css module
 import showcaseAnimations from "./showcase.module.scss";
 
 const container = ref();
 const { vAnimate, start, stop } = create({
  threshold: 60,
  defaultAnimationOptions: {
    cssVars: {
      offset: '50px',
    }
  }
 });
 
 onMounted(() => {
  // Listen globally on window scroll changes
  start();
 });
 
 onBeforeUnmount(() => {
  stop();
 });
</script>

<template>
  <div :class="$style.card" v-animate:card-pop="{ classes: showcaseAnimations }" />
</template>
```
:::

<div :class="$style.card" v-animate:card-pop="{ classes: showcaseAnimations }" />