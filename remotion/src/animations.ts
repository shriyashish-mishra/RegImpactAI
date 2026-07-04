import { interpolate, spring, type VideoConfig } from 'remotion'

/** Gentle fade-in over the first `frames` frames of a scene. */
export function fadeIn(frame: number, frames = 20): number {
  return interpolate(frame, [0, frames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
}

/** Gentle fade-out over the last `frames` frames of a scene of length `durationInFrames`. */
export function fadeOut(frame: number, durationInFrames: number, frames = 20): number {
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

/** Combined fade in + out — the standard "reveal, hold, release" curve every scene uses. */
export function fadeInOut(frame: number, durationInFrames: number, inFrames = 20, outFrames = 20): number {
  return Math.min(fadeIn(frame, inFrames), fadeOut(frame, durationInFrames, outFrames))
}

/** Slow, subtle upward drift — used instead of hard cuts for text/card reveals. */
export function slideUp(frame: number, fps: number, delayFrames = 0, distance = 24): number {
  const s = spring({ frame: frame - delayFrames, fps, config: { damping: 200, mass: 0.8 } })
  return interpolate(s, [0, 1], [distance, 0])
}

/** Subtle continuous zoom — the "slow camera movement" the brief asks for, never abrupt. */
export function subtleZoom(frame: number, durationInFrames: number, fromScale = 1, toScale = 1.06): number {
  return interpolate(frame, [0, durationInFrames], [fromScale, toScale], { extrapolateRight: 'clamp' })
}

/** Staggered entrance for list items — each item's own spring, offset by index. */
export function staggerDelay(index: number, gapFrames = 6): number {
  return index * gapFrames
}

export function springIn(frame: number, fps: number, delayFrames = 0): number {
  return spring({ frame: frame - delayFrames, fps, config: { damping: 200, mass: 0.6 } })
}

export type SceneVideoConfig = Pick<VideoConfig, 'fps'>
