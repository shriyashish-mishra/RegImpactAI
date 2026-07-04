import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneShell, SectionLabel } from '../components/SceneShell'
import { COLORS } from '../constants'
import { PRODUCT } from '../data/sampleData'

export function Scene04Description({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Auto-type across most of the scene, holding the finished sentence
  // fully visible for the last ~1.2s rather than cutting right as it finishes.
  const typingWindowFrames = durationInFrames - fps * 1.2
  const charsPerFrame = PRODUCT.description.length / Math.max(typingWindowFrames, 1)
  const visibleChars = Math.min(PRODUCT.description.length, Math.floor(frame * charsPerFrame))
  const visibleText = PRODUCT.description.slice(0, visibleChars)
  const showCursor = Math.floor(frame / 15) % 2 === 0 && visibleChars < PRODUCT.description.length

  return (
    <SceneShell durationInFrames={durationInFrames} zoom={false}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, height: '100%', justifyContent: 'center' }}>
        <SectionLabel index={3} label="Product Description" />
        <p
          style={{
            fontSize: 42,
            lineHeight: 1.5,
            color: COLORS.foreground,
            maxWidth: 1500,
            margin: 0,
          }}
        >
          {visibleText}
          {showCursor && <span style={{ color: COLORS.accent }}>|</span>}
        </p>
      </div>
    </SceneShell>
  )
}
