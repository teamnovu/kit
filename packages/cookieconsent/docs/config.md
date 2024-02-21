# Example Config

CookieConsent comes with a basic config that you'll have to overwrite to your project. You can build upon the following example. All options can be found at [Config docs](https://cookieconsent.orestbida.com/reference/configuration-reference.html).

Also, note that languages can be loaded from a different source like a language file or CMS. See [Language docs](https://cookieconsent.orestbida.com/advanced/language-configuration.html).

```js
const consentConfig: CookieConsentConfig = {

  // overwrite default config
  guiOptions: {
    consentModal: {
      layout: 'cloud', // instead of 'bar wide'
    },
  },

  categories: {
    functional: {
      services: {
        youtube: { label: 'Youtube Embed' },
        recaptcha: { label: 'Google Recaptcha' },
      },
    },
  },

  language: {
    default: 'de',
    translations: {
      de: {
        preferencesModal: {
          // !! If you change any section, you have to change all of them !!
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
                  {
                    name: 'Google Analytics',
                    description: 'Cookies von Google Analytics',
                    expiration: '2 Wochen',
                  },
                  {
                    name: 'Facebook',
                    description: 'Cookies von Facebook',
                    expiration: '2 Wochen',
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
}
```