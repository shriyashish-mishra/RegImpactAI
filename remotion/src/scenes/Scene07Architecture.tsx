import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneShell, SectionLabel } from '../components/SceneShell'
import { COLORS } from '../constants'
import { monoFont } from '../fonts'
import { PIPELINE_STAGES } from '../data/sampleData'
import { fadeIn, staggerDelay, slideUp } from '../animations'

export function Scene07Architecture({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <SceneShell durationInFrames={durationInFrames} zoom={false}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%', justifyContent: 'center' }}>
        <SectionLabel index={6} label="Architecture" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PIPELINE_STAGES.map((stage, i) => {
            const delay = staggerDelay(i, 8) + 8
            const opacity = fadeIn(frame - delay, 12)
            const x = slideUp(frame, fps, delay, 24)
            return (
              <div
                key={stage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  opacity,
                  transform: `translateX(${x}px)`,
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    backgroundColor: COLORS.surfaceRaised,
                    color: COLORS.accent,
                    fontFamily: monoFont,
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    flex: 1,
                    padding: '9px 20px',
                    backgroundColor: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 10,
                    fontSize: 21,
                    color: COLORS.foreground,
                  }}
                >
                  {stage}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </SceneShell>
  )
}
