'use client'

import { useState, useEffect } from 'react'
import ConfidenceBadge  from '@/components/primitives/ConfidenceBadge'
import CitationBlock    from '@/components/primitives/CitationBlock'
import NarratedProgress from '@/components/primitives/NarratedProgress'
import { readLines, parseStreamLine } from '@/lib/stream'
import type { ConfirmedModel, Question, Finding } from '@/lib/types'

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

const LENS_LABEL: Record<string, string> = {
  product:     'Product',
  ui:          'UI',
  engineering: 'Engineering',
  business:    'Business',
}

const SEVERITY_BORDER: Record<string, string> = {
  high:   'border-red-200 bg-red-50',
  medium: 'border-amber-200 bg-amber-50',
  low:    'border-slate-200 bg-slate-50',
}

const SEVERITY_DOT: Record<string, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-slate-400',
}

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          {state.phase === 'complete'
            ? `Assessment complete — ${state.findings.length} finding${state.findings.length === 1 ? '' : 's'}`
            : 'Assessing your product…'}
        </h1>
        <p className="text-slate-500 text-sm">
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
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{state.message}</p>
          <button onClick={runGeneration} className="mt-2 text-xs text-red-600 underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      {state.findings.length > 0 && (
        <div className="flex flex-col gap-4">
          {state.findings.map(finding => (
            <div key={finding.id} className={`border rounded-xl px-5 py-5 flex flex-col gap-4 ${SEVERITY_BORDER[finding.severity]}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${SEVERITY_DOT[finding.severity]}`} />
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">{finding.title}</h3>
                </div>
                <ConfidenceBadge level={finding.confidence} />
              </div>

              <p className="text-sm text-slate-600 leading-relaxed pl-4">{finding.what_found}</p>

              <div className="pl-4 flex flex-col gap-1.5">
                {finding.impacts.map((impact, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-slate-500 w-20 shrink-0 mt-0.5 uppercase tracking-wide">
                      {LENS_LABEL[impact.lens]}
                    </span>
                    <span className="text-xs text-slate-600">{impact.description}</span>
                  </div>
                ))}
              </div>

              {finding.recommendations[0] && (
                <div className="pl-4 pt-1 border-t border-black/5">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">Recommended: </span>
                    {finding.recommendations[0]}
                  </p>
                </div>
              )}

              <div className="pl-4">
                <CitationBlock citation={finding.citations[0]} />
              </div>
            </div>
          ))}
        </div>
      )}

      {state.phase === 'complete' && (
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onComplete}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors underline underline-offset-2"
          >
            View full report →
          </button>
        </div>
      )}
    </div>
  )
}
