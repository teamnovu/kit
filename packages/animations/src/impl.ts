import { parseDuration, throttleFn } from './util';
import {
  ScrollContainer,
  Animation,
  Node,
  Context,
  Options,
  Offset,
} from './types';

const THROTTLE_INTERVAL = 16;

function getElement(element: HTMLElement | Window) {
  if (element instanceof Window) return document?.documentElement;
  return element;
}

function getCorrectedBoundingClientRect(
  scrollContainer: ScrollContainer,
  target: HTMLElement,
) {
  const rect = target.getBoundingClientRect();
  if (scrollContainer instanceof Window) return rect; // No correction necessary

  const containerRect = getElement(scrollContainer).getBoundingClientRect();

  return {
    top: rect.top - containerRect.top,
    bottom: rect.bottom - containerRect.top,
    left: rect.left - containerRect.left,
    right: rect.right - containerRect.left,
    width: rect.width,
    height: rect.height,
  };
}

function getViewportDimensions(targetContainer: ScrollContainer) {
  const target = getElement(targetContainer);
  const scrollPositionX = target?.scrollLeft || window.pageXOffset;
  const scrollPositionY = target?.scrollTop || window.pageYOffset;

  return {
    top: scrollPositionY,
    bottom: scrollPositionY + target.clientHeight,
    left: scrollPositionX,
    right: scrollPositionX + target.clientWidth,
    height: target.clientHeight,
    width: target.clientWidth,
  };
}

function getAnimationClasses(
  ctx: Context,
  scrollContainer: ScrollContainer,
  node: Node,
): string[] {
  const viewport = getViewportDimensions(scrollContainer);
  const rect = getCorrectedBoundingClientRect(scrollContainer, node.element);
  const threshold = typeof ctx.threshold === 'function' ? ctx.threshold(node) : ctx.threshold;
  const getThreshold = (place: 'top' | 'bottom' | 'left' | 'right') => (typeof threshold === 'number'
    ? threshold
    : threshold[['top', 'right', 'left', 'bottom'].indexOf(place)]);

  const left = ctx.scrollDistance.x < 0;
  const right = ctx.scrollDistance.x > 0;
  const up = ctx.scrollDistance.y < 0;
  const down = ctx.scrollDistance.y > 0;

  if (!node.intersecting) {
    return [];
  }

  const isInTop = rect.bottom >= getThreshold('bottom');
  const isInBottom = rect.top <= viewport.height - getThreshold('top');
  const isInLeft = rect.right >= getThreshold('right');
  const isInRight = rect.left <= viewport.width - getThreshold('left');
  const isIn = isInTop && isInBottom && isInLeft && isInRight;

  const isOutTop = rect.bottom < getThreshold('bottom');
  const isOutBottom = rect.top > viewport.height - getThreshold('top');
  const isOutLeft = rect.right < getThreshold('right');
  const isOutRight = rect.left > viewport.width - getThreshold('left');
  const isOut = isOutTop || isOutBottom || isOutLeft || isOutRight;

  const getClasses = (classes: Record<string, boolean>) => Object.entries(classes)
    .filter(([_, v]) => v)
    .map(([k]) => k);

  // In / out / left / right all according to viewport
  // If we say in-bottom we are saying the element comes
  // in from the bottom of the viewport
  const inClasses = getClasses({
    in: isIn,
    'in-top': isInTop,
    'in-bottom': isInBottom,
    'in-left': isInLeft,
    'in-right': isInRight,
  });

  const outClasses = getClasses({
    out: isOut,
    'out-top': isOutTop,
    'out-bottom': isOutBottom,
    'out-left': isOutLeft,
    'out-right': isOutRight,
  });

  const directionClasses = getClasses({
    'to-left': left,
    'to-right': right,
    'to-up': up,
    'to-down': down,
  });

  const classes = ([] as string[]).concat(
    outClasses,
    outClasses.flatMap((outClass) => directionClasses.map((directionClass) => `${outClass}-${directionClass}`)),
    inClasses,
    inClasses.flatMap((inClass) => directionClasses.map((directionClass) => `${inClass}-${directionClass}`)),
  );

  return classes;
}

function animationCSSPropertyName(animationName: string, property: string) {
  return `--jk-animation-${animationName}-${property}`;
}

function animationTargets(node: Node, animation: Animation): HTMLElement[] {
  if (typeof animation.target === 'string') {
    const root = animation.target.trim().startsWith('&')
      ? node.element
      : document;
    const target = animation.target.trim().replace(/^&/, '');
    return [...root.querySelectorAll(target)] as HTMLElement[];
  }
  if (Array.isArray(animation.target)) {
    return animation.target;
  }

  if (animation.target instanceof HTMLElement) {
    return [animation.target];
  }

  return [node.element];
}

function getScrollContainer(
  ctx: Context,
  node: Node,
  animation: Animation,
): ScrollContainer {
  if (typeof animation.scrollContainer === 'string') {
    return (
      (node.element.closest(animation.scrollContainer) as ScrollContainer)
      ?? ctx.scrollContainer
    );
  }
  if (typeof animation.scrollContainer === 'function') {
    return animation.scrollContainer() ?? ctx.scrollContainer;
  }

  return animation.scrollContainer ?? ctx.scrollContainer ?? window;
}

function setCssVar(
  target: HTMLElement,
  animationName: string,
  property: string,
  value?: any,
) {
  if (value !== undefined) {
    target.style.setProperty(
      animationCSSPropertyName(animationName, property),
      value,
    );
  }
}

function addAnimationName(animation: Animation) {
  return (cls: string) => `${animation.name}-${cls}`;
}

function mapClasses(
  animation: Animation,
  classes: string[],
  classMap: Record<string, string>,
) {
  return [animation.name]
    .concat(classes.map(addAnimationName(animation)))
    .map((cls) => classMap[cls])
    .filter((cls) => !!cls);
}

function stopTransition(target: HTMLElement, animation: Animation) {
  setCssVar(target, animation.name, 'duration', 0);
  setCssVar(target, animation.name, 'delay', 0);
}

function stopTransitions(animation: Animation) {
  const { node } = animation;
  const targets = animationTargets(node, animation);

  for (const target of targets) {
    stopTransition(target, animation);
  }
}

function setCssVars(animation: Animation) {
  const { node } = animation;
  const cssVars = {
    ...animation.instance?.context.defaultAnimationOptions.cssVars,
    ...animation.cssVars,
  };
  const targets = animationTargets(node, animation);

  for (const target of targets) {
    for (const [name, value] of Object.entries(cssVars)) {
      setCssVar(target, animation.name, name, value.toString());
    }
  }
}

function startTransitions(animation: Animation) {
  const {
    delay, duration, stagger, node, easing,
  } = {
    ...animation.instance?.context.defaultAnimationOptions,
    ...animation,
  };
  const targets = animationTargets(node, animation);

  for (let index = 0; index < targets.length; index++) {
    const target = targets[index];
    const parsedDelay = animation.timeline
      ? animation.timeline.getDelay(animation)
      : parseDuration(delay);
    const targetDelay = (stagger ? index * stagger : 0) + parsedDelay;

    setCssVar(
      target,
      animation.name,
      'duration',
      typeof duration === 'number' ? `${duration / 1000}s` : duration,
    );
    setCssVar(target, animation.name, 'delay', `${targetDelay / 1000}s`);
    setCssVar(target, animation.name, 'easing', easing);
    setCssVars(animation);
  }
}

function removeClasses(classes: string[], animation: Animation) {
  const { node } = animation;

  const targets = animationTargets(node, animation);

  for (const cls of classes) {
    for (const target of targets) {
      if (target.classList.contains(cls)) {
        target.classList.remove(cls);
      }
    }
  }
}

function addClasses(classes: string[], animation: Animation) {
  const { node } = animation;

  const targets = animationTargets(node, animation);

  for (const cls of classes) {
    for (const target of targets) {
      if (!target.classList.contains(cls)) {
        target.classList.add(cls);
      }
    }
  }
}

function applyAnimation(ctx: Context, node: Node, animation: Animation) {
  const init = !animation.initialized;
  const scrollContainer = getScrollContainer(ctx, node, animation);
  const repeat = animation.repeatAnimation ?? ctx.defaultAnimationOptions.repeatAnimation;

  if (!animation.initialized) {
    // eslint-disable-next-line no-param-reassign
    animation.initialized = true;
  }

  let animationClasses = node.caches.appliedClasses;

  if (!animationClasses || ctx.scrollContainer !== scrollContainer) {
    animationClasses = getAnimationClasses(ctx, scrollContainer, node);
  }

  const classMap = {
    ...ctx.classes,
    ...animation.classes,
  };

  const baseClasses = mapClasses(
    animation,
    animationClasses.filter((cls) => !cls.startsWith('in')),
    classMap,
  );

  // Remove obsolete classes
  const toRemove = Object.entries(classMap)
    .filter(
      ([k]) => !animationClasses?.map(addAnimationName(animation))?.includes(k)
        && (repeat
          || init
          || k.replace(`${animation.name}-`, '').startsWith('out')),
    )
    .map(([, cls]) => cls)
    .filter((cls) => !baseClasses.includes(cls));

  const toAdd = mapClasses(
    animation,
    animationClasses.filter((cls) => repeat || init || !cls.startsWith('out')),
    classMap,
  ).filter((cls) => !baseClasses.includes(cls));

  setCssVars(animation);

  window.requestAnimationFrame(() => {
    if (init) {
      stopTransitions(animation);
      addClasses(baseClasses, animation);
      window.requestAnimationFrame(() => {
        startTransitions(animation);
        window.requestAnimationFrame(() => {
          addClasses(toAdd, animation);
        });
      });
    } else {
      window.requestAnimationFrame(() => {
        removeClasses(toRemove, animation);
        addClasses(toAdd, animation);
      });
    }
  });
}

function applyAnimations(ctx: Context, node: Node) {
  if (!document.body.contains(node.element)) return;

  // Calculate general animation classes first as optimization
  // so we don't have to calculate the classes for each animation
  // if they don't specify scrollContainers by themselves
  const animationClasses = getAnimationClasses(
    ctx,
    ctx.scrollContainer ?? window,
    node,
  );

  // eslint-disable-next-line no-param-reassign
  node.caches.appliedClasses = animationClasses;

  for (const animation of Object.values(node.animations)) {
    applyAnimation(ctx, node, animation);
  }
}

function unsetAnimation(ctx: Context, node: Node, animation: Animation) {
  const targets = animationTargets(node, animation);
  const animationClasses = getAnimationClasses(
    ctx,
    getScrollContainer(ctx, node, animation),
    node,
  );

  for (const target of targets) {
    target.style.removeProperty(
      animationCSSPropertyName(animation.name, 'duration'),
    );
    target.style.removeProperty(
      animationCSSPropertyName(animation.name, 'easing'),
    );
    target.style.removeProperty(
      animationCSSPropertyName(animation.name, 'delay'),
    );
    target.style.removeProperty(
      animationCSSPropertyName(animation.name, 'offset'),
    );

    const cssVars = {
      ...ctx.defaultAnimationOptions.cssVars,
      ...animation.cssVars,
    };

    for (const name of Object.keys(cssVars)) {
      target.style.removeProperty(
        animationCSSPropertyName(animation.name, name),
      );
    }

    const classMap = {
      ...ctx.classes,
      ...animation.classes,
    };

    const classesToRemove = mapClasses(animation, animationClasses, classMap);
    // Remove obsolete classes
    for (const cls of classesToRemove) {
      target.classList.remove(cls);
    }
  }
}

function setupResizeObserver(scrollContainer: ScrollContainer, cb: () => void) {
  const throttledListener = throttleFn(cb, THROTTLE_INTERVAL);
  const observer = new ResizeObserver(throttledListener);
  observer.observe(getElement(scrollContainer));

  return () => {
    observer.unobserve(getElement(scrollContainer));
  };
}

function setupScrollListener(
  scrollContainer: ScrollContainer,
  cb: (offset: Offset) => void,
) {
  const throttledListener = throttleFn(cb, THROTTLE_INTERVAL);
  scrollContainer.addEventListener('scroll', throttledListener);
  return () => {
    scrollContainer.removeEventListener('scroll', throttledListener);
  };
}

function setupIntersectionObserver(
  node: Element,
  cb: (entry: IntersectionObserverEntry) => void,
) {
  const throttledListener = throttleFn(([...entries]) => {
    cb(entries[0]);
  }, THROTTLE_INTERVAL);

  const observer = new IntersectionObserver(throttledListener, {
    threshold: Array.from(Array(99).keys(), (i) => i / 100 + 0.01),
  });
  observer.observe(node);

  return () => {
    observer.unobserve(node);
  };
}

function useScrollChanges(scrollContainer: ScrollContainer) {
  const container = getElement(scrollContainer);
  const getOffset = () => ({
    x: container.scrollLeft,
    y: container.scrollTop,
  });

  const state = {
    value: getOffset(),
  };

  const updateScrollChange = () => {
    state.value = getOffset();
  };

  return [state, updateScrollChange] as [
    typeof state,
    typeof updateScrollChange
  ];
}

function setupScrollContainerListeners(
  scrollContainer: ScrollContainer,
  cb: (offset: Offset) => void,
) {
  const [scrollChanges, updateScrollChange] = useScrollChanges(scrollContainer);

  const unregisterResizeObserver = setupResizeObserver(scrollContainer, () => {
    updateScrollChange();
    cb(scrollChanges.value);
  });

  const unregisterScrollListener = setupScrollListener(
    scrollContainer,
    (offset) => {
      updateScrollChange();
      cb(offset);
    },
  );

  return () => {
    unregisterResizeObserver();
    unregisterScrollListener();
  };
}

function destroyId(ctx: Context, id: string) {
  const destroyers = ctx.destroyers[id];
  if (!destroyers?.length) return;

  for (const destroyer of destroyers) {
    destroyer();
  }

  delete ctx.destroyers[id];
}

function addDestroyer(ctx: Context, id: string, destroyer: () => void) {
  if (!ctx.destroyers[id]) {
    ctx.destroyers[id] = [];
  }

  ctx.destroyers[id].push(destroyer);
}

function animationId(node: Node, animation: Animation) {
  return `${node.id}-${animation.name}`;
}

export function createContext(options: Options): Context {
  return {
    scrollContainer: undefined,
    scrollDistance: {
      x: 0,
      y: 0,
    },
    defaultAnimationOptions: {
      delay: 0,
      duration: 300,
      easing: 'ease',
      repeatAnimation: true,
      ...options.defaultAnimationOptions,
      cssVars: {
        offset: '50px',
        ...options.defaultAnimationOptions?.cssVars,
      },
    },
    nodes: {},
    classes: options.classes ?? {},
    threshold: options.threshold ?? 0,
    destroyers: {},
  };
}

export default function createInstance(options: Options) {
  const ctx: Context = createContext(options);
  let destroy: (() => void) | undefined;

  const removeNode = (node: Node | string) => {
    destroyId(ctx, typeof node === 'string' ? node : node.id);
  };

  const isStarted = () => !!destroy;

  const removeAnimation = (node: Node, animation: Animation) => {
    destroyId(ctx, animationId(node, animation));
  };

  const removeAnimations = (node: Node) => {
    for (const animation of Object.values(node.animations)) {
      removeAnimation(node, animation);
    }
  };

  const addAnimation = (node: Node, animation: Animation) => {
    removeAnimation(node, animation);
    // eslint-disable-next-line no-param-reassign
    node.animations[animation.name] = animation;

    const destroyAnimationFn = () => {
      unsetAnimation(ctx, node, animation);
      // eslint-disable-next-line no-param-reassign
      delete node.animations[animation.name];
    };

    addDestroyer(ctx, animationId(node, animation), destroyAnimationFn);

    if (!animation.scrollContainer) return;
    const scrollContainer = getScrollContainer(ctx, node, animation);
    if (scrollContainer === ctx.scrollContainer) return;

    const stopListeners = setupScrollContainerListeners(scrollContainer, () => {
      applyAnimation(ctx, node, animation);
    });

    const destroyFn = () => {
      stopListeners();
    };

    addDestroyer(ctx, animationId(node, animation), destroyFn);
  };

  const stop = () => {
    destroy?.();
    destroy = undefined;
  };

  const applyAnimationsBound = (node: Node) => applyAnimations(ctx, node);

  const addNode = (node: Node) => {
    ctx.nodes[node.id] = node;

    const unregisterIntersectionObserver = setupIntersectionObserver(
      node.element,
      (entry) => {
        // eslint-disable-next-line no-param-reassign
        node.intersecting = entry.isIntersecting;
        applyAnimationsBound(node);
      },
    );

    addDestroyer(ctx, node.id, () => {
      removeAnimations(node);
      unregisterIntersectionObserver();
      delete ctx.nodes[node.id];
    });
  };

  const start = (scrollContainer?: ScrollContainer) => {
    // Start has been called before and has not been
    // stopped yet so we just return destroy without
    // starting anything to ensure idempotency.
    if (destroy) return destroy;

    ctx.scrollContainer = scrollContainer ?? options.target ?? window;

    const removeListeners = setupScrollContainerListeners(
      ctx.scrollContainer,
      () => {
        for (const node of Object.values(ctx.nodes)) {
          applyAnimations(ctx, node);
        }
      },
    );

    const destroyNodes = () => {
      for (const node of Object.values(ctx.nodes)) {
        removeNode(node);
      }
    };

    destroy = () => {
      removeListeners();
      destroyNodes();
    };

    return destroy;
  };

  return {
    context: ctx,
    isStarted,
    start,
    addAnimation,
    removeNode,
    removeAnimation,
    removeAnimations,
    stop,
    addNode,
    applyAnimations: applyAnimationsBound,
  };
}
