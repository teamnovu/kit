import animate from '@teamnovu/kit-animations'
import type { Instance, Options as AnimationsOptions } from '@teamnovu/kit-animations'
import { defineNuxtPlugin, inject, useRuntimeConfig } from '#imports'

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
