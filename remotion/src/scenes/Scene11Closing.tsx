import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneShell } from '../components/SceneShell'
import { COLORS } from '../constants'
import { serifFont, monoFont } from '../fonts'
import { fadeIn, staggerDelay, slideUp } from '../animations'

const LINES = ['Built for modern fintech teams.', 'Designed for trust.', 'Engineered for explainability.']
const CTAS = ['Try Live Assessment', 'Explore Architecture', 'Read Case Study']

export function Scene11Closing({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 56 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {LINES.map((line, i) => {
            const delay = staggerDelay(i, 14) + 5
            const opacity = fadeIn(frame - delay, 16)
            const y = slideUp(frame, fps, delay, 18)
            return (
              <h2
                key={line}
                style={{
                  fontFamily: serifFont,
                  fontSize: 54,
                  color: COLORS.foreground,
                  margin: 0,
                  opacity,
                  transform: `translateY(${y}px)`,
                  textAlign: 'center',
                }}
              >
                {line}
              </h2>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {CTAS.map((cta, i) => {
            const delay = staggerDelay(i, 8) + 70
            const opacity = fadeIn(frame - delay, 16)
            return (
              <span
                key={cta}
                style={{
                  opacity,
                  fontFamily: monoFont,
                  fontSize: 22,
                  color: COLORS.accent,
                  border: `1px solid ${COLORS.accent}`,
                  borderRadius: 999,
                  padding: '16px 32px',
                }}
              >
                {cta} →
              </span>
            )
          })}
        </div>
      </div>
    </SceneShell>
  )
}
