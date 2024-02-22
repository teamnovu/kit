import {
  TransitionPresets,
  useTransition,
  type UseTransitionOptions,
} from '@vueuse/core';
import { capitalize } from 'lodash-es';
import {
  computed,
  unref,
  watch,
  ref,
  type Ref,
  onBeforeUnmount,
  onMounted,
  provide,
  nextTick,
} from 'vue';
import { nanoid } from 'nanoid'
import { useCollapseController } from './injects/collapseController';
import { collapseContextKey } from './injects/collapseContext';

export interface CollapseOptions extends UseTransitionOptions {
  id?: string;
  dimension?: 'width' | 'height';
  initiallyClosed?: boolean;
  controlled?: boolean;
  provide?: boolean;
}

export default function useCollapsable(
  elm?: HTMLElement | Ref<HTMLElement | undefined>,
  options?: CollapseOptions,
) {
  const id = options?.id ?? nanoid() as string;
  const dimension = computed(() => options?.dimension ?? 'height');

  const baseState = ref(options?.initiallyClosed ? 0 : 100);
  const isOpen = ref(!options?.initiallyClosed);

  const transition = useTransition(baseState, {
    ...options,
    duration: options?.duration ?? 300,
    transition: options?.transition ?? TransitionPresets.easeInOutCubic,
    onFinished: () => {
      window.requestAnimationFrame(() => {
        const element = unref(elm);
        if (!element || unref(transition) !== unref(baseState)) return;
        element.style.overflow = null as any;
        element.style[unref(dimension)] = null as any;
        if (unref(baseState) === 0) {
          element.style.display = 'none';
        }
        options?.onFinished?.();
      });
    },
  });

  const getElementScrollHeight = () => (unref(elm)?.[
      `scroll${capitalize(unref(dimension))}` as keyof Element
  ] as number) ?? 0;

  const scrollHeight = ref(getElementScrollHeight());

  const targetHeight = computed(
    () => (unref(transition) / 100) * unref(scrollHeight),
  );

  const prepareAnimation = async () => {
    const element = unref(elm);
    if (!element) return;

    // if the element is already open, get the scrollHeight now
    if (unref(baseState) > 0) {
      scrollHeight.value = getElementScrollHeight();
    }

    element.style.overflow = 'hidden';
    element.style.display = '';

    if (unref(baseState) === 0) {
      element.style[unref(dimension)] = '0';
      await nextTick();
      scrollHeight.value = getElementScrollHeight();
    } else {
      element.style[unref(dimension)] = '';
      await nextTick();
    }
  };

  const close = async () => {
    await prepareAnimation();
    baseState.value = 0;
  };

  const open = async () => {
    await prepareAnimation();
    baseState.value = 100;
  };

  watch(targetHeight, (newHeight) => {
    const element = unref(elm);
    if (!element) return;
    element.style[unref(dimension)] = `${newHeight}px`;
  });

  watch(isOpen, (newOpen, oldOpen) => {
    if (newOpen === oldOpen) return;

    if (newOpen) {
      open();
    } else {
      close();
    }
  });

  // If the Collapsable is controlled
  // its open-state can be controlled
  // by a collapse-controller
  if (options?.controlled) {
    const controller = useCollapseController();

    const uncontrol = controller?.control(id, isOpen);

    onBeforeUnmount(() => {
      uncontrol?.();
    });
  }

  if (options?.provide) {
    provide(collapseContextKey, { id, toggle: isOpen, ref: elm });
  }

  onMounted(() => {
    if (!isOpen.value) {
      const element = unref(elm);
      if (!element || !(element instanceof Element)) return;
      element.style.display = 'none';
    }
  });

  return isOpen;
}
