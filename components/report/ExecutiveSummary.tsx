// Executive summary — the "read this in 30 seconds and decide" front page
// of the report. Everything here is computed from the findings already
// produced (see lib/report/executiveSummary.ts) — no separate AI call.

import Link from 'next/link'
import type { Finding } from '@/lib/types'
import type { DiscoveryImpact } from '@/lib/report/mapper'
import { buildExecutiveSummary, type OverallRisk, type LaunchRecommendation } from '@/lib/report/executiveSummary'

type Props = {
  findings: Finding[]
  discoveryImpact: DiscoveryImpact
}

// Semantic status colors — not the surface/border/muted theme tokens, since
// these carry real meaning (risk level) that must read correctly both in
// the dark on-screen theme and on a printed/PDF page, which forces light
// equivalents via the print: variants below.
const RISK_STYLE: Record<OverallRisk, { label: string; className: string }> = {
  low:      { label: '🟢 Low',      className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 print:bg-emerald-50 print:text-emerald-700 print:border-emerald-200' },
  moderate: { label: '🟡 Moderate', className: 'bg-amber-500/10 text-amber-300 border-amber-500/30 print:bg-amber-50 print:text-amber-700 print:border-amber-200' },
  high:     { label: '🔴 High',     className: 'bg-red-500/10 text-red-300 border-red-500/30 print:bg-red-50 print:text-red-700 print:border-red-200' },
}

const RECOMMENDATION_STYLE: Record<LaunchRecommendation, { label: string; className: string }> = {
  ready:       { label: '✅ Ready for production',        className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 print:bg-emerald-50 print:text-emerald-700 print:border-emerald-200' },
  conditional: { label: '⚠️ Conditional — resolve blockers first', className: 'bg-amber-500/10 text-amber-300 border-amber-500/30 print:bg-amber-50 print:text-amber-700 print:border-amber-200' },
  not_ready:   { label: '❌ Not ready for production',    className: 'bg-red-500/10 text-red-300 border-red-500/30 print:bg-red-50 print:text-red-700 print:border-red-200' },
}

export default function ExecutiveSummary({ findings, discoveryImpact }: Props) {
  const summary = buildExecutiveSummary(findings)
  const risk = RISK_STYLE[summary.overallRisk]
  const recommendation = RECOMMENDATION_STYLE[summary.launchRecommendation]

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 bg-surface-raised">
        <span className="font-mono text-xs font-semibold text-accent uppercase tracking-widest">
          Executive Summary
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
        <div className="bg-surface px-5 py-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-subtle uppercase tracking-wide">Overall Risk</span>
          <span className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full border text-sm font-medium ${risk.className}`}>
            {risk.label}
          </span>
        </div>

        <div className="bg-surface px-5 py-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-subtle uppercase tracking-wide">Launch Recommendation</span>
          <span className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full border text-sm font-medium ${recommendation.className}`}>
            {recommendation.label}
          </span>
        </div>

        <div className="bg-surface px-5 py-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-subtle uppercase tracking-wide">Compliance Score</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-accent">{summary.complianceScore}%</span>
            <span className="text-xs text-muted">of tested clauses confirmed compliant</span>
          </div>
          <span className="text-xs text-subtle">
            {summary.compliantCount} compliant · {summary.nonCompliantCount} non-compliant · {summary.potentialGapCount} potential gap{summary.potentialGapCount === 1 ? '' : 's'} · {summary.infoRequiredCount} unconfirmed
          </span>
        </div>

        <div className="bg-surface px-5 py-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-subtle uppercase tracking-wide">Estimated Remediation Effort</span>
          <span className="text-lg font-semibold text-foreground">{summary.remediationEffort}</span>
          <span className="text-xs text-subtle">Rough sizing from blocking-issue count, not a detailed estimate</span>
        </div>
      </div>

      {summary.blockingIssues.length > 0 && (
        <div className="px-5 py-4 border-t border-border bg-surface flex flex-col gap-2">
          <span className="text-xs font-medium text-subtle uppercase tracking-wide">
            Blocking Issues ({summary.blockingIssues.length})
          </span>
          <ul className="list-disc list-inside">
            {summary.blockingIssues.map(f => (
              <li key={f.id} className="text-sm text-muted">{f.title}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-5 py-4 border-t border-border bg-surface flex flex-col gap-2">
        <span className="text-xs font-medium text-subtle uppercase tracking-wide">What Discovery Changed</span>
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <span className="text-muted">{discoveryImpact.questionsAsked} question{discoveryImpact.questionsAsked === 1 ? '' : 's'} asked</span>
          <span className="text-muted">{discoveryImpact.questionsAnswered} answered</span>
          <span className="text-muted">{discoveryImpact.remainingAssumptions} assumption{discoveryImpact.remainingAssumptions === 1 ? '' : 's'} remain unconfirmed</span>
        </div>
        <span className="text-xs text-subtle">
          This is why the wizard asks targeted follow-up questions instead of a generic intake form —
          the answers directly narrow what the assessment has to guess at.
        </span>
      </div>

      <div className="px-5 py-4 border-t border-border bg-surface flex flex-col gap-2">
        <span className="text-xs font-medium text-subtle uppercase tracking-wide">Regulatory Coverage</span>
        <p className="text-sm text-muted">
          {summary.totalAssessed} of {summary.totalAssessed} clauses considered produced a classified verdict below.
        </p>
        <span className="text-xs text-subtle">
          Every clause in scope for this product is tested directly and accounted for in this report —
          none are filtered out by a relevance step before reaching a conclusion. See{' '}
          <Link href="/architecture" className="text-accent hover:underline">/architecture</Link>{' '}
          for how the regulatory corpus is scoped.
        </span>
      </div>
    </div>
  )
}
