# Changelog

## [2.0.0](https://github.com/teamnovu/kit/compare/kit-composables-v1.3.1...kit-composables-v2.0.0) (2026-11-12)


### ⚠ BREAKING CHANGES

* **deps:** nanoid 6 requires Node.js ^22 || ^24 || >=26, which applies when @teamnovu/kit-animations or @teamnovu/kit-composables run server-side (SSR).
* **deps:** @teamnovu/kit-composables requires vue >= 3.5 (peer ^3.5.0, as required by @vueuse/core >= 12). useScrollState on a page that is already scrolled: VueUse 15 measures the scroll position on mount, so before mounting y is 0 and downward is false, and once mounted y reflects the position, downward is true and beginning is false (previously beginning stayed true until the first scroll event).

### Bug Fixes

* **deps:** require lodash-es 4.18.1 ([0a6698e](https://github.com/teamnovu/kit/commit/0a6698e65d068505add5707cc0fe2a9f909bf14c))
* **deps:** update @vueuse/core to 15 in composables ([39b1b2f](https://github.com/teamnovu/kit/commit/39b1b2f30ca130d0dcdf8b6f56df46280023ee51))
* **deps:** update nanoid to 6 ([2372c74](https://github.com/teamnovu/kit/commit/2372c742a035530f9ec8c8725b785864fe08efe9))
* publish only the build output ([ca77ca3](https://github.com/teamnovu/kit/commit/ca77ca3299c60bcb9c71927afbf8a7b8396d1804))
