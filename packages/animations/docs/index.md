# A package for animations

[[toc]]

## Installation

Install with `npm i @teamnovu/kit-animations`

## Api

### Per-Animation Options

```ts
export interface AnimationOptions {
  easing?: string;
  duration?: number | string;
  delay?: number | string;
  cssVars?: Record<string, string | number>;
  repeatAnimation?: boolean;
  stagger?: number;
  target?: HTMLElement[] | HTMLElement | string;
  timeline?: Timeline;
  timelineOffset?: string;
}
```

| Prop | Default | Description |
| ---- |  -----  | ----------- |
| easing | 'ease' | The animation easing function. Must be an easing-function known to CSS. |
| duration | 300 | The animation duration |
| delay | 0 | The animation delay |
| cssVars | `{ offset: '50px' }` | A map of values that should become available as CSS variables. The target CSS variable will be named according to the following scheme: `--jk-animation-${animationName}-${varName}` where `varName` is the key in the map. |
| repeatAnimation | true | If to repeat the animation if scrolling up/down. If set to false the animation will play only once ever. |
| stagger | undefined | If set makes the child animations stagger animations with the interval defined here. Only has an effect if `target` is set. |
| target | undefined | Defines the target for the animation. This is useful if you want the animation(s) to happen on child elements of the observed container. (Example: `& .animate`). Targetted animations can be staggered with `stagger` |
| timeline | undefined | A timeline created with `createTimeline`. |
| timelineOffset | undefined | Defines the offset of the animation on the timeline. Similar to https://gsap.com/docs/v3/GSAP/Timeline/ - supports `<`, `>`, `+=` and `-=` operations with absolute and percentage values. |


### Options for the instance creation

```ts
type Threshold = number | [number, number, number, number];

export interface Options {
  target?: HTMLElement;
  defaultAnimationOptions?: AnimationOptions;
  classes?: Record<string, string>;
  threshold: Threshold | (() => Threshold);
}
```

| Prop | Default | Description |
| ---- |  -----  | ----------- |
| target | undefined | The scrollContainer to be observed.  |
| defaultAnimationOptions | See [AnimationOptions](./#per-animation-options) | The default options for animations. |
| classes | Class mappings generated for the default animations through CSS Modules | A map of class-mappings. Only classes for which keys exist in the classes mapping will be applied. For a list of classes that can be used see [Available classes](./#available-classes-and-when-to-apply-them) |
| threshold | 0 | The threshold in `px` after which an element counts as within the viewport. Can be an array in the same order as CSS margins are defined.  |

You can create new instances with:

```
 const { start, stop, instance } = create({
  threshold: 50,
  defaultAnimationOptions: {
    cssVars: {
      offset: '50px',
    }
  }
 });
```

## Available classes and when to apply them

If you want to define the class `"out-right"` for the animation `"go-nuts"` you would define the class `go-nuts-out-right` in your css.

The first part: `out/in` defines if the element is within or without the viewport taking into account the defined threshold.

The following part of `top/bottom/left/right` (optional) defines the side of the viewport on which the element is `in/out`. E.g. if we say `in-bottom` we are saying that the element comes in from the bottom of the viewport.

::: info Note:
Currently class will also be applied if the element is not visible anymore due to scrolling down the page. Thus it only tells you if the elements top edge is higher up in the document than your viewports bottom.

If you also want to check if the element is **really** visible to to the user as well you can use `.in.in-bottom` as the class `in` is only applied if the element is visible to the user at least the amount of pixels set by `threshold`.
:::

The class `out-bottom` means that the element is out to the bottom of the viewport.

The last part `to-up/to-down/to-left/to-right` defines the direction the user was scrolling. E.g. `in-bottom-to-up` says that the user was just scrolling up and the element has crossed the lower boundary of your viewport.

The following classes are all available to be defined within a CSS module when prefixed with the animation name.

<!---
; Generated with:

(def sides #{"in" "out"})
(def dirs #{"top" "bottom" "left" "right"})
(def go-dirs #{"to-up" "to-down" "to-left" "to-right"})

(for [side sides
      dir (conj dirs nil)
      go-dir (conj go-dirs nil)]
  (clojure.string/join "-" (filter some? [side dir go-dir])))
-->

```js
"out"
"out-to-left"
"out-to-down"
"out-to-up"
"out-to-right"
"out-right"
"out-right-to-left"
"out-right-to-down"
"out-right-to-up"
"out-right-to-right"
"out-top"
"out-top-to-left"
"out-top-to-down"
"out-top-to-up"
"out-top-to-right"
"out-bottom"
"out-bottom-to-left"
"out-bottom-to-down"
"out-bottom-to-up"
"out-bottom-to-right"
"out-left"
"out-left-to-left"
"out-left-to-down"
"out-left-to-up"
"out-left-to-right"
"in"
"in-to-left"
"in-to-down"
"in-to-up"
"in-to-right"
"in-right"
"in-right-to-left"
"in-right-to-down"
"in-right-to-up"
"in-right-to-right"
"in-top"
"in-top-to-left"
"in-top-to-down"
"in-top-to-up"
"in-top-to-right"
"in-bottom"
"in-bottom-to-left"
"in-bottom-to-down"
"in-bottom-to-up"
"in-bottom-to-right"
"in-left"
"in-left-to-left"
"in-left-to-down"
"in-left-to-up"
"in-left-to-right"
```