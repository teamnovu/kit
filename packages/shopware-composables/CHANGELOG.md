# Changelog

## [0.2.0](https://github.com/teamnovu/kit/compare/kit-shopware-composables-v0.1.2...kit-shopware-composables-v0.2.0) (2026-11-12)


### ⚠ BREAKING CHANGES

* **deps:** @teamnovu/kit-shopware-composables requires vue >= 3.5 (peer ^3.5.0). @vueuse/core >= 12 already required it, so the previous ^3.0.0 peer was inaccurate.

### Bug Fixes

* **deps:** update @vueuse/core to 15 in shopware-composables ([8008979](https://github.com/teamnovu/kit/commit/8008979cce98700daf4d6cc6ef9d9d50a7f9c713))
* publish only the build output ([ca77ca3](https://github.com/teamnovu/kit/commit/ca77ca3299c60bcb9c71927afbf8a7b8396d1804))
* **shopware-composables:** accept mutation options as refs and getters ([66b5526](https://github.com/teamnovu/kit/commit/66b552639fb1dacb658fb15f324e55dc96afaea3))
* **shopware-composables:** forward all mutation callback arguments ([6ce2854](https://github.com/teamnovu/kit/commit/6ce2854992cf8ca3664b2c6b55832e9138658adf))
* **shopware-composables:** move vite from dependencies to devDependencies ([061cd8f](https://github.com/teamnovu/kit/commit/061cd8f84fcf9d97eef22642ab81663e11d8e95d))
* **shopware-composables:** wrap QueryCache.build instead of redeclaring it ([f934069](https://github.com/teamnovu/kit/commit/f934069ba9e070f574082d8500021f332f8571bd))


### Dependencies

* The following workspace dependencies were updated
  * peerDependencies
    * @teamnovu/kit-shopware-api-client bumped to 0.1.0
