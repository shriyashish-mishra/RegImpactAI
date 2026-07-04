import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { SceneShell, SectionLabel } from '../components/SceneShell'
import { COLORS } from '../constants'
import { monoFont } from '../fonts'
import { ASSESSMENT_EXAMPLE } from '../data/sampleData'
import { fadeIn, staggerDelay, slideUp } from '../animations'

const ROWS = [
  { label: 'Finding', value: ASSESSMENT_EXAMPLE.classification, accent: true },
  { label: 'Evidence', value: ASSESSMENT_EXAMPLE.evidenceFound, accent: false },
  { label: 'Verified Citation', value: ASSESSMENT_EXAMPLE.citation, accent: false },
  { label: 'Confidence', value: ASSESSMENT_EXAMPLE.confidenceReasoning, accent: false },
]

const ROW_ACTIVE_GAP = 16 // frames each row stays "spotlit" before the next takes over

/**
 * Connects Finding -> Evidence -> Verified Citation -> Confidence with a
 * vertical line whose highlighted segment travels down as each row
 * becomes active — so it reads as one continuous, traceable chain rather
 * than four unrelated facts appearing on screen.
 */
export function Scene08Assessment({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const rowDelays = ROWS.map((_, i) => staggerDelay(i, 26) + 12)
  const activeIndex = rowDelays.reduce((active, delay, i) => (frame >= delay + ROW_ACTIVE_GAP ? i : active), 0)

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, height: '100%', justifyContent: 'center' }}>
        <SectionLabel index={7} label="Assessment" />
        <h3 style={{ fontSize: 38, color: COLORS.foreground, margin: 0, maxWidth: 1400, fontWeight: 500 }}>
          {ASSESSMENT_EXAMPLE.title}
        </h3>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Connector rail — fills downward as each row activates */}
          <div style={{ width: 3, backgroundColor: COLORS.border, borderRadius: 2, position: 'relative', marginTop: 6, marginBottom: 6 }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${((activeIndex + 1) / ROWS.length) * 100}%`,
                backgroundColor: COLORS.accent,
                borderRadius: 2,
                transition: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            {ROWS.map((row, i) => {
              const delay = rowDelays[i]
              const opacity = fadeIn(frame - delay, 14)
              const y = slideUp(frame, fps, delay, 14)
              const isActive = i === activeIndex
              const glow = interpolate(frame - (delay + ROW_ACTIVE_GAP), [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              return (
                <div
                  key={row.label}
                  style={{
                    opacity,
                    transform: `translateY(${y}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    padding: '10px 16px',
                    marginLeft: -16,
                    borderRadius: 10,
                    backgroundColor: isActive ? `${COLORS.accent}0f` : 'transparent',
                    boxShadow: isActive ? `0 0 ${20 * glow}px ${COLORS.accent}22` : 'none',
                  }}
                >
                  <span style={{ fontFamily: monoFont, fontSize: 15, textTransform: 'uppercase', letterSpacing: 2, color: isActive ? COLORS.accent : COLORS.subtle }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: row.accent ? 30 : 22, color: row.accent ? COLORS.red : COLORS.muted, fontWeight: row.accent ? 700 : 400 }}>
                    {row.value}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </SceneShell>
  )
}
