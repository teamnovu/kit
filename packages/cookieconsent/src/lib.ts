/* eslint-disable import/prefer-default-export */

import type { InjectionKey } from 'vue';
import type { CookieConsent } from './types';

export const CookieConsentSymbol: InjectionKey<CookieConsent> = Symbol('CookieConsent');

export const isServer = typeof window === 'undefined';
