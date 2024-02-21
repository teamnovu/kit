import { Animation } from './types';
import { animationTargets, parseDuration } from './util';

function parseAnchor(offset?: string): [string, number, boolean] {
  if (!offset) return ['end', 0, false];

  const isPercentage = offset.endsWith('%');
  if (offset[0] === '<') {
    return [
      'anim-start',
      parseFloat(offset.replace(/<(\+=)?/, '')),
      isPercentage,
    ];
  }
  if (offset[0] === '>') {
    return [
      'anim-end',
      parseFloat(offset.replace(/>(\+=)?/, '')),
      isPercentage,
    ];
  }
  if (offset.startsWith('+=')) {
    return ['end', parseFloat(offset.replace('+=', '')), isPercentage];
  }
  if (offset.startsWith('-=')) {
    return ['start', parseFloat(offset.replace('+=', '')), isPercentage];
  }

  return ['end', 0, false];
}

function animationWithDefaults(animation: Animation) {
  return {
    ...animation.instance?.context.defaultAnimationOptions,
    ...animation,
  };
}

function fullAnimationDuration(animation?: Animation) {
  if (!animation) {
    return 0;
  }

  const anim = animationWithDefaults(animation);

  return (
    (animationTargets(anim).length - 1) * (anim.stagger ?? 0)
    + parseDuration(anim.duration)
  );
}

export default function createTimeline() {
  let animations: Animation[] = [];

  const addAnimation = (animation: Animation) => {
    animations.push(animation);
  };

  const getDelay = (animation: Animation) => {
    const index = animations.findIndex((anim) => anim.name === animation.name);
    if (!index) return 0;

    const prevAnimations = animations.slice(0, index);
    const durations = prevAnimations.map((prevAnimation) => {
      const duration = fullAnimationDuration(prevAnimation)
        + parseDuration(animationWithDefaults(prevAnimation).delay);

      return duration;
    });

    const lastAnimationStart = durations
      .slice(0, -1)
      .reduce((total, current) => total + current, 0);
    const lastAnimationEnd = lastAnimationStart + fullAnimationDuration(prevAnimations.at(-1));

    const timelineOffset = animation.timelineOffset?.trim();

    const [anchorName, offset, isPercentage] = parseAnchor(timelineOffset);

    let anchor = lastAnimationEnd;
    let range = lastAnimationEnd;

    if (anchorName === 'anim-start') {
      anchor = lastAnimationStart;
      range = lastAnimationEnd - lastAnimationStart;
    } else if (anchorName === 'anim-end') {
      anchor = lastAnimationEnd;
      range = lastAnimationEnd - lastAnimationStart;
    } else if (anchorName === 'start') {
      anchor = 0;
      range = lastAnimationEnd;
    } else if (anchorName === 'end') {
      anchor = lastAnimationEnd;
      range = lastAnimationEnd;
    }

    const actualOffset = isPercentage ? range * offset : offset * 1000;

    return anchor + actualOffset;
  };

  const removeAnimation = (animation: Animation) => {
    animations = animations.filter((anim) => anim.name !== animation.name);
  };

  return {
    addAnimation,
    removeAnimation,
    getDelay,
  };
}

export type Timeline = ReturnType<typeof createTimeline>;
