import React from 'react'
import { useCurrentFrame } from 'remotion'
import { SceneShell, SectionLabel } from '../components/SceneShell'
import { COLORS } from '../constants'
import { TECH_STACK } from '../data/sampleData'
import { fadeIn, staggerDelay } from '../animations'

export function Scene10TechStack({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, height: '100%', justifyContent: 'center' }}>
        <SectionLabel index={9} label="Technology" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, maxWidth: 1500 }}>
          {TECH_STACK.map((item, i) => {
            const delay = staggerDelay(i, 4) + 8
            const opacity = fadeIn(frame - delay, 12)
            return (
              <span
                key={item}
                style={{
                  opacity,
                  fontSize: 26,
                  color: COLORS.foreground,
                  border: `1px solid ${COLORS.accent}55`,
                  borderRadius: 999,
                  padding: '14px 28px',
                }}
              >
                {item}
              </span>
            )
          })}
        </div>
      </div>
    </SceneShell>
  )
}
