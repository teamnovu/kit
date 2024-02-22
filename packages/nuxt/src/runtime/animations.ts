import animate, {
  type Instance,
  type Options as AnimationsOptions,
} from '@teamnovu/kit-animations';
// @ts-expect-error no types
// eslint-disable-next-line import/no-unresolved
import { defineNuxtPlugin, inject, useRuntimeConfig } from '#imports';

export default defineNuxtPlugin(({ vueApp, hook }: any) => {
  const runtimeConfig = useRuntimeConfig();
  const config = (runtimeConfig?.public?.kit.animations ?? {}) as AnimationsOptions;

  vueApp.use(animate, config);

  const anim = inject('@teamnovu/kit-animations') as Instance;

  hook('page:transition:finish', () => {
    for (const node of Object.values(anim.context.nodes)) {
      anim.applyAnimations(node);
    }
  });
});
