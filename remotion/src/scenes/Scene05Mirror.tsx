import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneShell, SectionLabel } from '../components/SceneShell'
import { COLORS } from '../constants'
import { monoFont } from '../fonts'
import { WHAT_YOU_TOLD_US, WHAT_WE_UNDERSTOOD } from '../data/sampleData'
import { fadeIn, staggerDelay, slideUp } from '../animations'

function Column({
  title, items, delayBase, frame, fps,
}: { title: string; items: string[]; delayBase: number; frame: number; fps: number }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <span style={{ fontFamily: monoFont, fontSize: 18, textTransform: 'uppercase', letterSpacing: 2, color: COLORS.subtle }}>
        {title}
      </span>
      {items.map((item, i) => {
        const delay = delayBase + staggerDelay(i, 6)
        const opacity = fadeIn(frame - delay, 14)
        const y = slideUp(frame, fps, delay, 14)
        return (
          <div
            key={item}
            style={{
              padding: '16px 20px',
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              opacity,
              transform: `translateY(${y}px)`,
              fontSize: 24,
              color: COLORS.foreground,
            }}
          >
            {item}
          </div>
        )
      })}
    </div>
  )
}

export function Scene05Mirror({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, height: '100%', justifyContent: 'center' }}>
        <SectionLabel index={4} label="Mirror Understanding" />
        <div style={{ display: 'flex', gap: 48 }}>
          <Column title="What You Told Us" items={WHAT_YOU_TOLD_US} delayBase={5} frame={frame} fps={fps} />
          <Column title="What RegImpact Understood" items={WHAT_WE_UNDERSTOOD} delayBase={40} frame={frame} fps={fps} />
        </div>
      </div>
    </SceneShell>
  )
}
