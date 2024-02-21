<template>
  <span v-if="!src" />
  <span v-else-if="svg" :alt="alt" v-html="svg" />
  <img v-else ref="imageRef" :alt="alt" loading="lazy" />
</template>

<script setup lang="ts">
import { watch, onMounted, ref, unref, onBeforeUnmount, computed } from "vue";

// #region Interfaces

interface Image {
  svg: string;
  src: string;
  small: string;
  normal: string;
  large: string;
  alt: string;
}

interface Props {
  src: Image | string;
}

// #endregion

// #region Definitions

const props = defineProps<Props>();
const observerRef = ref<ResizeObserver>();
const imageRef = ref<HTMLImageElement>();

// #endregion

// #region Methods

const updateSrc = () => {
  const image = unref(imageRef);
  if (!image) return;

  if (typeof props.src === "string") {
    image.src = props.src;
    return;
  }

  const boxWidth =
    image.getBoundingClientRect().width * window.devicePixelRatio;

  if (boxWidth <= 600) image.src = props.src.small;
  else if (boxWidth <= 1000) image.src = props.src.normal;
  else image.src = props.src.large;
};

const isImageObject = (value: Image | string): value is Image =>
  typeof value === "object";

// #endregion

// #region Watchers

watch(
  () => props.src,
  () => updateSrc()
);

// #endregion

// #region Computed

const alt = computed(() =>
  isImageObject(props.src) ? props.src.alt : undefined
);
const svg = computed(() =>
  isImageObject(props.src) ? props.src.svg : undefined
);

// #endregion

// #region Lifecycle

onMounted(() => {
  const image = unref(imageRef);
  if (!props.src || (typeof props.src === "object" && props.src.svg)) return;
  if (!image) return;

  if (typeof window !== "undefined" && typeof ResizeObserver === "function") {
    observerRef.value = new ResizeObserver(updateSrc);
    observerRef.value.observe(image);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined" && typeof ResizeObserver === "function") {
    const image = unref(imageRef);
    const observer = unref(observerRef);
    if (observer && image) observer.unobserve(image);
  }
});

// #endregion
</script>
