/* eslint-disable no-unused-vars */

import * as VanillaConsent from 'vanilla-cookieconsent/types';
import type { Ref } from 'vue';

declare global {
    interface Window {
        prerender: boolean;
    }
}
export interface Services {
        [key: string]: boolean
    }

export interface CookieConsentConfig extends VanillaConsent.CookieConsentConfig {
        onConsent?: never
        onChange?: never
    }

export type CookieConsent = Omit<typeof VanillaConsent, 'acceptService'> & {
        services: Ref<Services>
        acceptService: (category: string, service?: string) => void
    }
