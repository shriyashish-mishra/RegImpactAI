import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneShell } from '../components/SceneShell'
import { COLORS } from '../constants'
import { serifFont, monoFont } from '../fonts'
import { slideUp, springIn } from '../animations'

export function Scene01Hero({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const titleY = slideUp(frame, fps, 10)
  const tagOpacity = springIn(frame, fps, 30)

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 32 }}>
        <span style={{ fontFamily: monoFont, fontSize: 22, textTransform: 'uppercase', letterSpacing: 6, color: COLORS.accent }}>
          AI Product · FinTech · RegTech
        </span>
        <h1
          style={{
            fontFamily: serifFont,
            fontSize: 140,
            color: COLORS.foreground,
            letterSpacing: -2,
            transform: `translateY(${titleY}px)`,
            margin: 0,
          }}
        >
          RegImpact AI
        </h1>
        <p style={{ fontSize: 36, color: COLORS.muted, opacity: tagOpacity, margin: 0, maxWidth: 1100, textAlign: 'center' }}>
          Evidence-backed AI compliance for fintech.
        </p>
      </div>
    </SceneShell>
  )
}
