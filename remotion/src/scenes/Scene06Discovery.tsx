import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneShell, SectionLabel } from '../components/SceneShell'
import { COLORS } from '../constants'
import { DISCOVERY_QUESTIONS } from '../data/sampleData'
import { fadeIn, staggerDelay, slideUp } from '../animations'

export function Scene06Discovery({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, height: '100%', justifyContent: 'center' }}>
        <SectionLabel index={5} label="Adaptive Discovery" />
        <p style={{ fontSize: 28, color: COLORS.subtle, margin: 0, maxWidth: 1300 }}>
          Only genuine uncertainty triggers a follow-up question.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {DISCOVERY_QUESTIONS.map((q, i) => {
            const delay = staggerDelay(i, 22) + 10
            const opacity = fadeIn(frame - delay, 16)
            const y = slideUp(frame, fps, delay, 16)
            return (
              <div
                key={q.prompt}
                style={{
                  padding: 24,
                  backgroundColor: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 14,
                  opacity,
                  transform: `translateY(${y}px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 26, color: COLORS.foreground, fontWeight: 500 }}>{q.prompt}</span>
                <span style={{ fontSize: 24, color: COLORS.accent }}>{q.answer}</span>
              </div>
            )
          })}
        </div>
      </div>
    </SceneShell>
  )
}
