import type { BaseTransitionProps } from 'vue';

// Code taken directly from
// https://github.com/vuejs/core/blob/main/packages/runtime-dom/src/components/Transition.ts
// Its ugly but it works
const TRANSITION = 'transition';
const ANIMATION = 'animation';

export type AnimationTypes = typeof TRANSITION | typeof ANIMATION

export interface TransitionProps extends BaseTransitionProps<Element> {
  name?: string
  type?: AnimationTypes
}

let endId = 0;

export async function awaitTransitionEnds(
  el: Element & { _transitionEndId?: number },
  expectedType: TransitionProps['type'] | undefined,
  explicitTimeout: number | null,
) {
  return new Promise((resolve) => {
    whenTransitionEnds(el, expectedType, explicitTimeout, () => resolve(undefined));
  });
}

function whenTransitionEnds(
  el: Element & { _transitionEndId?: number },
  expectedType: TransitionProps['type'] | undefined,
  explicitTimeout: number | null,
  resolve: () => void,
) {
  const id = (el._transitionEndId = ++endId);
  const resolveIfNotStale = () => {
    if (id === el._transitionEndId) {
      resolve();
    }
  };

  if (explicitTimeout) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }

  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) {
    return resolve();
  }

  const endEvent = `${type}end`;
  let ended = 0;
  const end = () => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  };
  const onEnd = (e: Event) => {
    if (e.target === el && ++ended >= propCount) {
      end();
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}

interface CSSTransitionInfo {
  type: AnimationTypes | null
  propCount: number
  timeout: number
  hasTransform: boolean
}

type AnimationProperties = 'Delay' | 'Duration'
type StylePropertiesKey =
  | `${AnimationTypes}${AnimationProperties}`
  | `${typeof TRANSITION}Property`

export function getTransitionInfo(
  el: Element,
  expectedType?: TransitionProps['type'],
): CSSTransitionInfo {
  const styles = window.getComputedStyle(el) as Pick<
    CSSStyleDeclaration,
    StylePropertiesKey
  >;
  // JSDOM may return undefined for transition properties
  const getStyleProperties = (key: StylePropertiesKey) => (styles[key] || '').split(', ');
  const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
  const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
  const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
  const animationTimeout = getTimeout(animationDelays, animationDurations);

  let type: CSSTransitionInfo['type'] = null;
  let timeout = 0;
  let propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  const hasTransform = type === TRANSITION
    && /\b(transform|all)(,|$)/.test(
      getStyleProperties(`${TRANSITION}Property`).toString(),
    );
  return {
    type,
    timeout,
    propCount,
    hasTransform,
  };
}

function getTimeout(delays: string[], durations: string[]): number {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}

// Old versions of Chromium (below 61.0.3163.100) formats floating pointer
// numbers in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down
// (i.e. acting as a floor function) causing unexpected behaviors
function toMs(s: string): number {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000;
}
