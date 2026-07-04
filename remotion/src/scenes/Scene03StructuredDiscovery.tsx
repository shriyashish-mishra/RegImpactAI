import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneShell, SectionLabel } from '../components/SceneShell'
import { CursorClick } from '../components/CursorClick'
import { COLORS } from '../constants'
import { monoFont } from '../fonts'
import { PRODUCT } from '../data/sampleData'
import { fadeIn, staggerDelay, slideUp } from '../animations'

const FIELDS = [
  { label: 'Industry', values: [PRODUCT.industry] },
  { label: 'Product Categories', values: PRODUCT.categories },
  { label: 'Operating Geographies', values: PRODUCT.geographies },
  { label: 'Target Customers', values: PRODUCT.targetCustomers },
  { label: 'Regulated Entities', values: PRODUCT.regulatedEntities },
  { label: 'Capabilities', values: PRODUCT.capabilities },
]

export function Scene03StructuredDiscovery({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, height: '100%', justifyContent: 'center' }}>
        <SectionLabel index={2} label="Structured Product Discovery" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {FIELDS.map((f, i) => {
            const delay = staggerDelay(i, 8) + 10
            const opacity = fadeIn(frame - delay, 16)
            const y = slideUp(frame, fps, delay, 16)
            return (
              <div
                key={f.label}
                style={{
                  padding: 28,
                  backgroundColor: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 16,
                  opacity,
                  transform: `translateY(${y}px)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <span style={{ fontFamily: monoFont, fontSize: 16, textTransform: 'uppercase', letterSpacing: 2, color: COLORS.subtle }}>
                  {f.label}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {f.values.map(v => (
                    <span
                      key={v}
                      style={{
                        fontSize: 20,
                        color: COLORS.foreground,
                        border: `1px solid ${COLORS.accent}55`,
                        borderRadius: 999,
                        padding: '6px 16px',
                      }}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <CursorClick clickAtFrame={36} x={795} y={513} />
      </div>
    </SceneShell>
  )
}
