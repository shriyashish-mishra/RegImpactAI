import React from 'react'
import { useCurrentFrame, useVideoConfig } from 'remotion'
import { SceneShell, SectionLabel } from '../components/SceneShell'
import { COLORS } from '../constants'
import { monoFont } from '../fonts'
import { EXECUTIVE_SUMMARY, FINDING_BREAKDOWN, CLAUSES_EVALUATED } from '../data/sampleData'
import { fadeIn, staggerDelay, springIn } from '../animations'

/**
 * Reveals in the order the creative direction specifies: Executive
 * Summary label, then compliance score, then launch recommendation, then
 * the findings breakdown — never all at once.
 */
export function Scene09ExecutiveReport({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const scoreDelay = 8
  const scoreProgress = springIn(frame, fps, scoreDelay)
  const displayedScore = Math.round(scoreProgress * EXECUTIVE_SUMMARY.complianceScore)

  const recommendationDelay = 38
  const recommendationOpacity = fadeIn(frame - recommendationDelay, 16)

  const clausesDelay = 50
  const clausesProgress = springIn(frame, fps, clausesDelay)
  const displayedClauses = Math.round(clausesProgress * CLAUSES_EVALUATED)

  const breakdownEntries = [
    { label: 'Compliant', value: FINDING_BREAKDOWN.compliant },
    { label: 'Non-Compliant', value: FINDING_BREAKDOWN.nonCompliant },
    { label: 'Potential Gap', value: FINDING_BREAKDOWN.potentialGap },
    { label: 'Info Required', value: FINDING_BREAKDOWN.infoRequired },
  ]
  const breakdownBaseDelay = 66

  return (
    <SceneShell durationInFrames={durationInFrames}>
      <div style={{ display: 'flex', gap: 64, height: '100%', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
          <SectionLabel index={8} label="Executive Report" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 120, fontWeight: 700, color: COLORS.foreground }}>{displayedScore}</span>
            <span style={{ fontSize: 32, color: COLORS.subtle }}>/ 100 compliance score</span>
          </div>
          <span style={{ fontSize: 28, color: COLORS.red, fontWeight: 600, opacity: recommendationOpacity }}>
            {EXECUTIVE_SUMMARY.launchRecommendation}
          </span>
          <span style={{ fontSize: 24, color: COLORS.subtle, opacity: recommendationOpacity }}>
            {EXECUTIVE_SUMMARY.blockingIssues} blocking issues identified
          </span>
          <div style={{ display: 'flex', gap: 32, marginTop: 8, opacity: recommendationOpacity }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: monoFont, fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, color: COLORS.subtle }}>
                Clauses Evaluated
              </span>
              <span style={{ fontSize: 34, fontWeight: 700, color: COLORS.foreground }}>{displayedClauses}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {breakdownEntries.map((e, i) => {
            const delay = breakdownBaseDelay + staggerDelay(i, 10)
            const opacity = fadeIn(frame - delay, 14)
            const countProgress = springIn(frame, fps, delay)
            const displayedValue = Math.round(countProgress * e.value)
            return (
              <div
                key={e.label}
                style={{
                  opacity,
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  backgroundColor: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  fontSize: 26,
                }}
              >
                <span style={{ color: COLORS.muted }}>{e.label}</span>
                <span style={{ color: COLORS.foreground, fontFamily: monoFont, fontWeight: 700 }}>{displayedValue}</span>
              </div>
            )
          })}
        </div>
      </div>
    </SceneShell>
  )
}
