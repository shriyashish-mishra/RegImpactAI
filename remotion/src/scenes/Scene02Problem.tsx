import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneShell, SectionLabel } from '../components/SceneShell'
import { COLORS } from '../constants'
import { serifFont } from '../fonts'
import { slideUp, staggerDelay, fadeIn } from '../animations'

const PROBLEMS = [
  'Manual reviews take weeks',
  'Interpretation varies reviewer to reviewer',
  "Generic AI can't explain its reasoning",
]

export function Scene02Problem({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48, height: '100%', justifyContent: 'center' }}>
        <SectionLabel index={1} label="The Problem" />
        <h2 style={{ fontFamily: serifFont, fontSize: 72, color: COLORS.foreground, margin: 0, maxWidth: 1300 }}>
          Compliance review wasn&apos;t built for how fast fintech ships.
        </h2>
        <div style={{ display: 'flex', gap: 28 }}>
          {PROBLEMS.map((p, i) => {
            const delay = staggerDelay(i, 10) + 15
            const y = slideUp(frame, fps, delay)
            const opacity = fadeIn(frame - delay, 18)
            return (
              <div
                key={p}
                style={{
                  flex: 1,
                  padding: 32,
                  backgroundColor: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 16,
                  transform: `translateY(${y}px)`,
                  opacity,
                }}
              >
                <span style={{ fontSize: 30, color: COLORS.foreground, fontWeight: 500 }}>{p}</span>
              </div>
            )
          })}
        </div>
      </div>
    </SceneShell>
  )
}
