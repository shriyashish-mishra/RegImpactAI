import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { COLORS } from '../constants'
import { fadeInOut, subtleZoom } from '../animations'
import { sansFont, monoFont } from '../fonts'

type Props = {
  durationInFrames: number
  children: React.ReactNode
  /** Disables the ambient zoom for scenes with their own internal motion (e.g. lists). */
  zoom?: boolean
}

/**
 * Every scene's background + fade + the "slow camera movement" the brief
 * asks for — a barely-perceptible zoom over the scene's lifetime, never a
 * hard cut in or out.
 */
export function SceneShell({ durationInFrames, children, zoom = true }: Props) {
  const frame = useCurrentFrame()
  const opacity = fadeInOut(frame, durationInFrames)
  const scale = zoom ? subtleZoom(frame, durationInFrames) : 1

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        fontFamily: sansFont,
        color: COLORS.foreground,
        opacity,
      }}
    >
      <AbsoluteFill style={{ transform: `scale(${scale})`, padding: 100 }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

export function SectionLabel({ index, label }: { index: number; label: string }) {
  return (
    <span style={{ fontFamily: monoFont, fontSize: 22, textTransform: 'uppercase', letterSpacing: 4, color: COLORS.accent }}>
      V_{String(index).padStart(2, '0')} / {label}
    </span>
  )
}
