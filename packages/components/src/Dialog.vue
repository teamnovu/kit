<template>
  <dialog
    v-show="show"
    ref="dialogRef"
    :inert="!show"
    :role="role"
    :aria-modal="modal"
    :modal="modal"
    @cancel.prevent="close"
    @close.prevent="close"
  >
    <slot :close="close" />
  </dialog>
</template>

<script lang="ts" setup>
import { useVModel } from '@vueuse/core';
import {
  computed, nextTick, ref, unref, watch,
} from 'vue';
import { useDialogFocus } from './utils/dialog';
import { awaitTransitionEnds, type AnimationTypes } from './utils/transition';

// #region Types

interface Props {
  modal?: boolean;
  alert?: boolean;
  show?: boolean;
  animationDuration?: number;
  animationType?: AnimationTypes;
}

// #endregion

// #region Definitions

const props = defineProps<Props>();
const emit = defineEmits(['update:show', 'close']);

const show = useVModel(props, 'show', emit, { passive: true });
const dialogRef = ref<HTMLDialogElement>();

const { stashFocus, moveFocusInside, restoreFocus } = useDialogFocus(dialogRef);

// #endregion

// #region Lifecycle
// #endregion

// #region Computed

const role = computed(() => {
  if (props.alert) return 'alertdialog';
  return undefined;
});

// #endregion

// #region Methods

const waitForAnimations = async (element: Element) => {
  // wait for vue to rerender
  await nextTick();
  return awaitTransitionEnds(
    element,
    props.animationType,
    props.animationDuration ?? null,
  );
};

const handleClose = async () => {
  const dialog = unref(dialogRef);
  if (!dialog) {
    emit('close');
    return undefined;
  }

  await waitForAnimations(dialog);

  dialog.close(dialog.returnValue);
  restoreFocus();
  emit('close', dialog.returnValue);

  return dialog.returnValue;
};

const openDialog = async () => {
  const dialog = unref(dialogRef);
  if (!dialog) return;

  stashFocus();

  if (props.modal) dialog.showModal();
  else dialog.show();

  await waitForAnimations(dialog);

  moveFocusInside();
};

const close = async (event: Event) => {
  if (event.type === 'close') return;
  show.value = false;
};

// #endregion

// #region Watchers

watch(dialogRef, async (newDialog, prevDialog) => {
  if (newDialog && !prevDialog && show.value) await openDialog();
})

watch(show, async (newShow, prevShow) => {
  if (newShow === prevShow) return;
  const dialog = unref(dialogRef);
  if (!dialog) return;

  if (newShow) await openDialog();
  else await handleClose();
}, { immediate: true });

// # endregion
</script>
