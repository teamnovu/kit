/* eslint-disable no-unused-vars */

import type { Ref } from 'vue';
import * as VanillaConsent from 'vanilla-cookieconsent/types';

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

export type CookieConsent = typeof VanillaConsent & {
        services: Ref<Services>
        acceptService: (service: string, category?: string) => void
    }
