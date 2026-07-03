'use client'

import { useState, useEffect } from 'react'
import NarratedProgress from '@/components/primitives/NarratedProgress'
import FindingCard from '@/components/report/FindingCard'
import QuotaExceededScreen from '@/components/primitives/QuotaExceededScreen'
import { readLines, parseStreamLine } from '@/lib/stream'
import { sortByPriority } from '@/lib/report/executiveSummary'
import type { ConfirmedModel, Question, Finding, QuotaExceededResponse } from '@/lib/types'

type Props = {
  confirmedModel: ConfirmedModel
  questions:      Question[]
  assessmentId:   string
  onComplete:     () => void
}

type State =
  | { phase: 'generating'; steps: string[]; findings: Finding[] }
  | { phase: 'complete';   steps: string[]; findings: Finding[] }
  | { phase: 'error';      steps: string[]; findings: Finding[]; message: string }
  | { phase: 'quota_exceeded'; resetAt: string }

export default function GeneratingScreen({ confirmedModel, questions, assessmentId, onComplete }: Props) {
  const [state, setState] = useState<State>({ phase: 'generating', steps: [], findings: [] })

  useEffect(() => { runGeneration() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function runGeneration() {
    setState({ phase: 'generating', steps: [], findings: [] })
    const steps: string[] = []
    const findings: Finding[] = []

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmedModel, questions }),
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null)
        if (res.status === 429 && data?.error === 'quota_exceeded') {
          setState({ phase: 'quota_exceeded', resetAt: (data as QuotaExceededResponse).resetAt })
          return
        }
        throw new Error(data?.error ?? 'Failed to generate assessment')
      }

      const reader = res.body.getReader()
      for await (const line of readLines(reader)) {
        const event = parseStreamLine(line)
        if (!event) continue

        if (event.type === 'step') {
          steps.push(event.text)
          setState({ phase: 'generating', steps: [...steps], findings: [...findings] })
        } else if (event.type === 'finding') {
          findings.push(event.finding)
          setState({ phase: 'generating', steps: [...steps], findings: [...findings] })
        } else if (event.type === 'error') {
          setState({ phase: 'error', steps: [...steps], findings: [...findings], message: event.message })
          return
        } else if (event.type === 'done') {
          setState({ phase: 'complete', steps: [...steps], findings: [...findings] })
          return
        }
      }
    } catch (err) {
      setState({
        phase: 'error',
        steps,
        findings,
        message: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      })
    }
  }

  if (state.phase === 'quota_exceeded') {
    return <QuotaExceededScreen resetAt={state.resetAt} />
  }

  const flaggedCount = state.findings.filter(f => f.classification !== 'compliant').length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          {state.phase === 'complete'
            ? `Assessment complete — ${state.findings.length} clause${state.findings.length === 1 ? '' : 's'} assessed, ${flaggedCount} flagged`
            : 'Assessing your product…'}
        </h1>
        <p className="text-muted text-sm">
          {state.phase === 'complete'
            ? 'Review findings below, then open the full report.'
            : 'Testing applicable RBI regulations against your confirmed product model.'}
        </p>
      </div>

      <NarratedProgress
        steps={state.steps}
        complete={state.phase === 'complete'}
      />

      {state.phase === 'error' && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-300">{state.message}</p>
          <button onClick={runGeneration} className="mt-2 text-xs text-red-300 underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      {state.phase !== 'complete' && state.findings.length > 0 && (
        <div className="flex flex-col gap-4">
          {state.findings.map(finding => (
            <FindingCard key={finding.id} finding={finding} variant="compact" />
          ))}
        </div>
      )}

      {/* Once streaming finishes, regroup and sort exactly like the final
          report (see ReportView) instead of leaving findings in arrival
          order — arrival order is honest signal while still streaming, but
          once nothing more is moving it should read the same as the report
          the user is about to open. */}
      {state.phase === 'complete' && (() => {
        const flagged = sortByPriority(state.findings.filter(f => f.classification !== 'compliant'))
        const compliant = state.findings.filter(f => f.classification === 'compliant')
        return (
          <>
            {flagged.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-foreground">Findings requiring attention</h2>
                {flagged.map(finding => (
                  <FindingCard key={finding.id} finding={finding} variant="compact" />
                ))}
              </div>
            )}
            {compliant.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-foreground">Confirmed compliant</h2>
                {compliant.map(finding => (
                  <FindingCard key={finding.id} finding={finding} variant="compact" />
                ))}
              </div>
            )}
          </>
        )
      })()}

      {state.phase === 'complete' && (
        <div className="flex justify-end pt-2 border-t border-border">
          <button
            onClick={onComplete}
            className="text-sm font-medium text-accent hover:underline transition-colors underline-offset-2"
          >
            View full report →
          </button>
        </div>
      )}
    </div>
  )
}
