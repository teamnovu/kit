import { defineNuxtPlugin, inject, useRuntimeConfig } from '#imports'
import type { Options as AnimationsOptions, Instance } from '@teamnovu/kit-animations'
import animate from '@teamnovu/kit-animations'

export default defineNuxtPlugin(({ vueApp, hook }) => {
  const runtimeConfig = useRuntimeConfig()
  const config = (runtimeConfig?.public?.kit.animations ?? {}) as AnimationsOptions

  vueApp.use(animate, config)

  const anim = inject('@teamnovu/kit-animations') as Instance

  hook('page:transition:finish', () => {
    for (const node of Object.values(anim.context.nodes)) {
      anim.applyAnimations(node)
    }
  })
})
