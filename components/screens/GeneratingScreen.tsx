'use client'

import { useState, useEffect } from 'react'
import ConfidenceBadge  from '@/components/primitives/ConfidenceBadge'
import CitationBlock    from '@/components/primitives/CitationBlock'
import NarratedProgress from '@/components/primitives/NarratedProgress'
import type { ConfirmedModel, Question, Finding } from '@/lib/types'

type Props = {
  confirmedModel: ConfirmedModel
  questions:      Question[]
  assessmentId:   string
  onComplete:     () => void
}

type State =
  | { phase: 'generating'; steps: string[] }
  | { phase: 'complete';   steps: string[]; findings: Finding[] }
  | { phase: 'error';      message: string }

const STUB_STEPS = [
  'Testing Digital Lending Guidelines against your product model…',
  'Checking KFS disclosure requirement against Loan offer screen…',
  'Checking direct disbursal requirement…',
  'Checking grievance redressal obligation…',
  'Checking cooling-off period requirement…',
  'Assessment complete.',
]

const STUB_FINDINGS: Finding[] = [
  {
    id:                   crypto.randomUUID(),
    assessment_id:        '',
    area_code:            'DLG',
    area_name:            'Digital Lending Guidelines',
    title:                'Key Fact Statement not shown before loan acceptance',
    what_found:           'The Loan offer screen presents the offer and an "Accept" action without a Key Fact Statement summarising APR, fees, and cooling-off terms.',
    why_matters:          'RBI Digital Lending Guidelines require a standardised KFS before the borrower accepts. This applies because you offer digital personal loans.',
    severity:             'high',
    confidence:           'high',
    driver_clarity:       'high',
    driver_understanding: 'high',
    impacts: [
      { lens: 'ui',          description: 'Loan offer screen: add KFS interstitial before Accept action.' },
      { lens: 'engineering', description: 'Offer service must compute and persist APR and all-in fees.' },
      { lens: 'business',    description: 'KFS content requires compliance review before launch.' },
      { lens: 'product',     description: 'Loan acceptance flow must enforce KFS viewing before proceeding.' },
    ],
    citations: [{
      corpus_clause_id: 'a1b2c3d4-0001-0001-0001-000000000003',
      clause_ref:       'DLG Para 6 — Key Fact Statement',
      clause_text:      'REs shall provide a Key Fact Statement (KFS) to the borrower before the execution of the loan contract. The KFS shall include the Annual Percentage Rate (APR), all-in cost including fees and charges, and the grievance redressal mechanism.',
      source_title:     'RBI Digital Lending Guidelines, September 2022',
    }],
    recommendations: [
      'Insert a KFS interstitial screen before the loan Accept action; block acceptance until the borrower has viewed it.',
      'Ensure KFS displays APR, all-in cost breakdown, cooling-off period, and grievance contact.',
    ],
  },
  {
    id:                   crypto.randomUUID(),
    assessment_id:        '',
    area_code:            'DLG',
    area_name:            'Digital Lending Guidelines',
    title:                'Cooling-off period mechanism not confirmed',
    what_found:           'No cooling-off or look-up period mechanism was found in the repayment flow.',
    why_matters:          'DLG Para 6 mandates a minimum 3-day cooling-off window for loans of 7 days or more during which the borrower can exit without penalty.',
    severity:             'high',
    confidence:           'moderate',
    driver_clarity:       'high',
    driver_understanding: 'moderate',
    impacts: [
      { lens: 'ui',          description: 'Repayment screen: add a "Cancel loan" option within 3 days of disbursal.' },
      { lens: 'engineering', description: 'Loan service must enforce penalty-free cancellation within the cooling-off window.' },
      { lens: 'business',    description: 'Collections team must not contact borrower within the cooling-off period.' },
      { lens: 'product',     description: 'Loan product terms must state the cooling-off period explicitly.' },
    ],
    citations: [{
      corpus_clause_id: 'a1b2c3d4-0001-0001-0001-000000000004',
      clause_ref:       'DLG Para 6 — Cooling-off Period',
      clause_text:      'The borrower shall be given an explicit option to exit the digital loan by paying back the principal and the proportionate APR without any penalty during a cooling-off / look-up period.',
      source_title:     'RBI Digital Lending Guidelines, September 2022',
    }],
    recommendations: [
      'Implement a penalty-free loan cancellation option available for 3 days post-disbursal.',
      'Display cooling-off period terms on the Loan offer screen and post-acceptance confirmation.',
    ],
  },
]

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
  const [state, setState] = useState<State>({ phase: 'generating', steps: [] })

  useEffect(() => { runGeneration() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function runGeneration() {
    setState({ phase: 'generating', steps: [] })
    // Stub — replaced by real /api/generate streaming call in Milestone 5
    const steps: string[] = []
    for (const step of STUB_STEPS) {
      await new Promise(r => setTimeout(r, 650))
      steps.push(step)
      setState({ phase: 'generating', steps: [...steps] })
    }
    await new Promise(r => setTimeout(r, 300))
    setState({ phase: 'complete', steps, findings: STUB_FINDINGS })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          {state.phase === 'complete'
            ? `Assessment complete — ${state.findings.length} findings`
            : 'Assessing your product…'}
        </h1>
        <p className="text-slate-500 text-sm">
          {state.phase === 'complete'
            ? 'Review findings below, then open the full report.'
            : 'Testing applicable RBI regulations against your confirmed product model.'}
        </p>
      </div>

      <NarratedProgress
        steps={state.phase !== 'error' ? state.steps : []}
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

      {state.phase === 'complete' && (
        <>
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
                      <span className="text-xs font-semibold text-slate-400 w-20 shrink-0 mt-0.5 uppercase tracking-wide">
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

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={onComplete}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors underline underline-offset-2"
            >
              View full report →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
