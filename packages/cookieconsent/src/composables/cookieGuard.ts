import { watch, ref, type Ref } from 'vue';
import { useCookieConsent } from '../index';
import { isServer } from '../lib';

export interface GuardState {
    allowed: Ref<boolean>
    acceptService?: (category: string, service?: string) => void
}

export default function useCookieGuard(require: string): GuardState {
  const allowed = ref(false);

  if (isServer) {
    return { allowed };
  }

  const CookieConsent = useCookieConsent();
  if (CookieConsent) {
    watch(CookieConsent.services, (services) => {
      allowed.value = services[require] ?? false;
    }, { immediate: true });
  }

  return {
    allowed,
    acceptService: CookieConsent?.acceptService,
  };
}
