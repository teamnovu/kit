import { CookieConsentConfig } from './types';

const consentConfig: CookieConsentConfig = {

  guiOptions: {
    consentModal: {
      layout: 'box wide',
      equalWeightButtons: true,
    },
    preferencesModal: {
      equalWeightButtons: true,
    },
  },

  categories: {
    necessary: {
      enabled: true,
      readOnly: true,
    },
    functional: {
      enabled: false,
      readOnly: false,
      services: { },
    },
    analytics: {
      enabled: false,
      readOnly: false,
      autoClear: {
        cookies: [{ name: /^_/ }],
      },
    },
  },

  language: {
    default: 'de',
    translations: {
      de: {
        consentModal: {
          title: 'Cookies &amp; Tracking',
          description:
              'Wir verwenden Cookies, um das Nutzererlebnis auf unserer Webseite zu verbessern, unseren Datenverkehr zu analysieren, Inhalte zu personalisieren und Social Media-Funktionen bereitzustellen.<br /><br />Mehr Details erfahren Sie in unserer <a href="/datenschutz">Datenschutzerklärung</a>.',
          acceptAllBtn: 'Alle akzeptieren',
          acceptNecessaryBtn: 'Alle ablehnen',
          showPreferencesBtn: 'Auswahl erlauben',
        },
        preferencesModal: {
          title: 'Cookie-Einstellungen',
          acceptAllBtn: 'Alle akzeptieren',
          acceptNecessaryBtn: 'Alle ablehnen',

          savePreferencesBtn: 'Einstellungen speichern',
          closeIconLabel: 'Schliessen',
          sections: [
            {
              title: 'Cookie Nutzung',
              description:
                  'Wir verwenden Cookies, um die grundlegenden Funktionen der Website zu gewährleisten und um Ihr Online-Erlebnis zu verbessern. Sie können für jede Kategorie wählen, ob Sie sich ein- oder austragen möchten, wann immer Sie wollen. Weitere Einzelheiten zu Cookies und anderen sensiblen Daten finden Sie in der vollständigen <a href="/datenschutz" class="cc-link">Datenschutzrichtlinie</a>.',
            },
            {
              title: 'Notwendige Cookies',
              description:
                  'Diese Cookies sind für das ordnungsgemäße Funktionieren meiner Website unerlässlich.',
              linkedCategory: 'necessary',
              cookieTable: {
                headers: {
                  name: 'Name',
                  description: 'Description',
                  expiration: 'Gültigkeit',
                },
                body: [
                  {
                    name: 'CC Cookie',
                    description: 'Speichern der Cookie auswahl',
                    expiration: '6 Monate',
                  },
                  {
                    name: 'PHPSESSID',
                    description: 'Speichern der Sprachauswahl',
                    expiration: 'Session',
                  },
                ],
              },
            },
            {
              title: 'Funktionale Cookies',
              description:
                'Diese Cookies ermöglichen die erweiterte Nutzung der Webseite, wie das laden von Videos welche über dritte Anbieter eingebunden werden oder das Absenden geschützter Formulare.',
              linkedCategory: 'functional',
            },
            {
              title: 'Analyse Cookies',
              description:
                  'Statistik-Cookies helfen Website-Besitzern zu verstehen, wie Besucher mit Websites interagieren, indem sie Informationen sammeln und melden.',
              linkedCategory: 'analytics',
              cookieTable: {
                headers: {
                  name: 'Name',
                  description: 'Description',
                  expiration: 'Gültigkeit',
                },
                body: [
                  // {
                  //   name: 'Google Analytics',
                  //   description: 'Cookies von Google Analytics',
                  //   expiration: '2 Wochen',
                  // },
                  // {
                  //   name: 'Facebook',
                  //   description: 'Cookies von Facebook',
                  //   expiration: '2 Wochen',
                  // },
                ],
              },
            },
          ],
        },
      },
    },
  },
};

export default consentConfig;
