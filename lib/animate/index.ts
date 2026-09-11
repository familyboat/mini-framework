import { disableInteraction } from "../interaction";
import { hideElement, showElement } from "../router";
import { withResolvers } from "../util";
import "./index.css";

/**
 * Built-in enter animation names.
 * External consumers can extend this interface via declaration merging.
 */
export interface EnterAnimationNameMap {
  'fade-in': never
  'left-slide-in': never
  'right-slide-in': never
}

/**
 * Built-in leave animation names.
 * External consumers can extend this interface via declaration merging.
 */
export interface LeaveAnimationNameMap {
  'fade-out': never
  'left-slide-out': never
  'right-slide-out': never
}

/**
 * Public animation names for enter transitions.
 * Built-in names keep editor auto-completion, while custom names remain supported.
 */
export type EnterAnimationName = keyof EnterAnimationNameMap

/**
 * Public animation names for leave transitions.
 * Built-in names keep editor auto-completion, while custom names remain supported.
 */
export type LeaveAnimationName = keyof LeaveAnimationNameMap

/** Options for customizing one animation call. */
export type AnimationOptions = {
  /** CSS time value, such as `300ms` or `1.5s`. */
  duration?: string
  /** CSS time value applied before the animation starts. */
  delay?: string
}

type ActiveAnimation = {
  cancel: () => void
}

const activeAnimations = new WeakMap<HTMLElement, ActiveAnimation>()

function animateElement(
  root: HTMLElement,
  animationType: EnterAnimationName | LeaveAnimationName,
  onEnd: () => void,
  options?: AnimationOptions,
): Promise<boolean> {
  activeAnimations.get(root)?.cancel()

  const {promise, resolve} = withResolvers<boolean>()
  const restoreInteraction = disableInteraction(root)
  const previousDuration = root.style.getPropertyValue('--duration')
  const previousDelay = root.style.getPropertyValue('--delay')
  let finished = false

  if (options?.duration !== undefined) {
    root.style.setProperty('--duration', options.duration)
  }
  if (options?.delay !== undefined) {
    root.style.setProperty('--delay', options.delay)
  }

  const finish = (completed: boolean) => {
    if (finished) {
      return
    }
    finished = true
    root.removeEventListener('animationend', handleAnimationEnd)
    root.removeEventListener('animationcancel', handleAnimationCancel)
    root.classList.remove(animationType)
    if (completed) {
      onEnd()
    }
    restoreInteraction()
    root.style.setProperty('--duration', previousDuration)
    root.style.setProperty('--delay', previousDelay)
    if (activeAnimations.get(root)?.cancel === cancel) {
      activeAnimations.delete(root)
    }
    resolve(completed)
  }

  const cancel = () => finish(false)

  const handleAnimationEnd = (event: AnimationEvent) => {
    if (event.target === root && event.animationName === animationType) {
      finish(true)
    }
  }

  const handleAnimationCancel = (event: AnimationEvent) => {
    if (event.target === root && event.animationName === animationType) {
      finish(false)
    }
  }

  root.addEventListener('animationend', handleAnimationEnd)
  root.addEventListener('animationcancel', handleAnimationCancel)
  activeAnimations.set(root, {cancel})
  root.classList.add(animationType)

  return promise
}

/**
 * Shows an element with any CSS animation class.
 * The class name must match the CSS animation name.
 * Starting another animation on the same element cancels the previous one.
 *
 * @param root Element to animate.
 * @param enterType CSS class and animation name to apply.
 * @param options Optional duration and delay overrides.
 * @returns A promise that resolves to `true` when the animation ends, or
 * `false` when it is cancelled.
 */
export function enterElement(
  root: HTMLElement,
  enterType: EnterAnimationName,
  options?: AnimationOptions,
): Promise<boolean> {
  showElement(root)
  return animateElement(root, enterType, () => {}, options)
}

/**
 * Hides an element after any CSS animation class completes.
 * The class name must match the CSS animation name.
 * Starting another animation on the same element cancels the previous one.
 *
 * @param root Element to animate and hide.
 * @param leaveType CSS class and animation name to apply.
 * @param options Optional duration and delay overrides.
 * @returns A promise that resolves to `true` when the animation ends, or
 * `false` when it is cancelled.
 */
export function leaveElement(
  root: HTMLElement,
  leaveType: LeaveAnimationName,
  options?: AnimationOptions,
): Promise<boolean> {
  return animateElement(root, leaveType, () => hideElement(root), options)
}

/**
 * Shows an element with a fade-in animation.
 *
 * @param root Element to animate.
 * @param options Optional duration and delay overrides.
 * @returns A promise that resolves to `true` when the animation ends, or
 * `false` when it is cancelled.
 */
export function fadeIn(root: HTMLElement, options?: AnimationOptions): Promise<boolean> {
  return enterElement(root, 'fade-in', options)
}

/**
 * Hides an element with a fade-out animation.
 *
 * @param root Element to animate and hide.
 * @param options Optional duration and delay overrides.
 * @returns A promise that resolves to `true` when the animation ends, or
 * `false` when it is cancelled.
 */
export function fadeOut(root: HTMLElement, options?: AnimationOptions): Promise<boolean> {
  return leaveElement(root, 'fade-out', options)
}

/**
 * Shows an element by sliding in from the left.
 *
 * @param root Element to animate.
 * @param options Optional duration and delay overrides.
 * @returns A promise that resolves to `true` when the animation ends, or
 * `false` when it is cancelled.
 */
export function leftSlideIn(root: HTMLElement, options?: AnimationOptions): Promise<boolean> {
  return enterElement(root, 'left-slide-in', options)
}

/**
 * Shows an element by sliding in from the right.
 *
 * @param root Element to animate.
 * @param options Optional duration and delay overrides.
 * @returns A promise that resolves to `true` when the animation ends, or
 * `false` when it is cancelled.
 */
export function rightSlideIn(root: HTMLElement, options?: AnimationOptions): Promise<boolean> {
  return enterElement(root, 'right-slide-in', options)
}

/**
 * Hides an element by sliding out to the left.
 *
 * @param root Element to animate and hide.
 * @param options Optional duration and delay overrides.
 * @returns A promise that resolves to `true` when the animation ends, or
 * `false` when it is cancelled.
 */
export function leftSlideOut(root: HTMLElement, options?: AnimationOptions): Promise<boolean> {
  return leaveElement(root, 'left-slide-out', options)
}

/**
 * Hides an element by sliding out to the right.
 *
 * @param root Element to animate and hide.
 * @param options Optional duration and delay overrides.
 * @returns A promise that resolves to `true` when the animation ends, or
 * `false` when it is cancelled.
 */
export function rightSlideOut(root: HTMLElement, options?: AnimationOptions): Promise<boolean> {
  return leaveElement(root, 'right-slide-out', options)
}
