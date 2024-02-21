<template>
  <template v-if="isServer"></template>
  <slot v-else-if="allowed" name="default" />
  <slot v-else name="rejected" :serviceName="serviceName" :acceptService="CookieConsent?.acceptService">
    <div class="cc-rejected">
      <div>{{ rejectText.replace('{service}', serviceName) }}</div>
      <button @click="() => CookieConsent?.acceptService(service)">
        {{ buttonText.replace('{service}', serviceName) }}
      </button>
    </div>
  </slot>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCookieGuard, useCookieConsent } from '../index';

const props = withDefaults(defineProps<{
  service: string
  rejectText?: string
  buttonText?: string
}>(), {
  rejectText: 'You have not accepted the usage of {service}.',
  buttonText: 'Accept {service}'
})

const CookieConsent = useCookieConsent();

const { allowed } = useCookieGuard(props.service)

const isServer = ref(true)
const serviceName = ref('')
onMounted(() => {
  isServer.value = false

  const [category, service] = props.service.split('.')
  serviceName.value = CookieConsent?.getConfig().categories[category].services?.[service]?.label ?? ''
})

</script>
