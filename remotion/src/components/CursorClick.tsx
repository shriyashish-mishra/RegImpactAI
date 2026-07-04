import React from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { COLORS } from '../constants'

type Props = {
  /** Frame (relative to the scene) the cursor should arrive and click at. */
  clickAtFrame: number
  x: number
  y: number
}

/**
 * A simulated pointer that drifts in, "clicks" with an expanding ripple,
 * then fades — the touch that keeps a scene from reading as a raw screen
 * recording. Subtle by design: small, brief, never the focal point.
 */
export function CursorClick({ clickAtFrame, x, y }: Props) {
  const frame = useCurrentFrame()
  const relative = frame - (clickAtFrame - 20)
  if (relative < 0 || relative > 40) return null

  const arrival = interpolate(relative, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const cursorOpacity = interpolate(relative, [0, 6, 34, 40], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rippleProgress = interpolate(relative, [20, 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rippleOpacity = interpolate(relative, [20, 34], [0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const cursorX = x - (1 - arrival) * 40
  const cursorY = y - (1 - arrival) * 24

  return (
    <div style={{ position: 'absolute', left: cursorX, top: cursorY, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          width: 60 * rippleProgress,
          height: 60 * rippleProgress,
          borderRadius: '50%',
          border: `2px solid ${COLORS.accent}`,
          opacity: rippleOpacity,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          backgroundColor: COLORS.accent,
          opacity: cursorOpacity,
          boxShadow: `0 0 12px ${COLORS.accent}`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}
