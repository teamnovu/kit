import { toReactive } from '@vueuse/core';
import {
  MaybeRef,
  provide,
  watch, type Ref,
} from 'vue';
import { collapseControllerKey } from './injects/collapseController';

interface AccordionOptions {
  provide?: boolean;
  value?: MaybeRef<Record<string, boolean>>;
}

export default function useAccordion(options?: AccordionOptions) {
  const controlled = toReactive(options?.value ?? {}) as Record<string, boolean>;

  const ensureOneOnly = () => {
    const stillTrue = Object.entries(controlled).filter(([_, bool]) => bool);

    if (stillTrue.length > 1) {
      for (const [key] of stillTrue.slice(0, -1)) {
        controlled[key] = false;
      }
    }
  };

  watch(
    () => ({ ...controlled }),
    (newControlled, oldControlled) => {
      if (oldControlled) {
        const keys = Object.keys(newControlled);

        const unchanged = keys.filter(
          (key) => newControlled[key] === oldControlled[key],
        );

        const changed = keys.filter(
          (key) => newControlled[key] !== oldControlled[key],
        );

        if (!unchanged.length || !newControlled[changed[0]]) {
          return;
        }

        for (const key of unchanged) {
          controlled[key] = false;
        }

        ensureOneOnly();
      }
    },
    { immediate: true },
  );

  const control = (id: string, open: Ref<boolean>) => {
    controlled[id] = open as unknown as boolean;
    ensureOneOnly();
    return () => {
      delete controlled[id];
    };
  };

  if (options?.provide) {
    provide(collapseControllerKey, { control });
  }

  return control;
}
