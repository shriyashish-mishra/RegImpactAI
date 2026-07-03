// Shared finding card — used by both the live-streaming preview
// (GeneratingScreen) and the full report (ReportView). Previously these two
// components hand-rolled near-identical markup independently; consolidated
// here so the classification/evidence UI added for explainability only has
// one place to live.
//
// Section order is deliberate: Finding -> Evidence -> Citation, so a reader
// can trace a conclusion back to its source without hunting for it —
// citations used to render after recommendations, which broke that chain.

import type { Finding, FindingClassification } from '@/lib/types'
import ConfidenceBadge from '@/components/primitives/ConfidenceBadge'
import CitationBlock   from '@/components/primitives/CitationBlock'
import { priorityTier, type PriorityTier } from '@/lib/report/executiveSummary'
import { hasWeakEvidenceSupport } from '@/lib/report/trust'

type Props = {
  finding: Finding
  // compact: live-streaming preview — one citation, one recommendation, no
  // evidence breakdown. full: the real report — everything.
  variant?: 'full' | 'compact'
}

const LENS_LABEL: Record<string, string> = {
  product:     'Product',
  ui:          'UI',
  engineering: 'Engineering',
  business:    'Business',
}

// Classification/priority colors carry real meaning, so they use raw
// Tailwind color utilities (not the surface/border theme tokens) with
// explicit print: variants — a dark-mode red-500/5 tint is illegible on a
// printed PDF page, which needs the light red-50/red-700 equivalent instead.
const CLASSIFICATION_STYLE: Record<FindingClassification, {
  border: string
  dot: string
  icon: string
  label: string
  labelColor: string
}> = {
  compliant:     { border: 'border-emerald-500/30 bg-emerald-500/5 print:border-emerald-200 print:bg-emerald-50', dot: 'bg-emerald-400', icon: '✅', label: 'Compliant',     labelColor: 'text-emerald-300 print:text-emerald-700' },
  non_compliant: { border: 'border-red-500/30 bg-red-500/5 print:border-red-200 print:bg-red-50',                 dot: 'bg-red-400',     icon: '❌', label: 'Non-Compliant', labelColor: 'text-red-300 print:text-red-700' },
  potential_gap: { border: 'border-amber-500/30 bg-amber-500/5 print:border-amber-200 print:bg-amber-50',         dot: 'bg-amber-400',   icon: '⚠️', label: 'Potential Gap', labelColor: 'text-amber-300 print:text-amber-700' },
  info_required: { border: 'border-border bg-surface',                                                            dot: 'bg-subtle',      icon: '❓', label: 'Info Required', labelColor: 'text-muted' },
}

const PRIORITY_STYLE: Record<PriorityTier, string> = {
  critical: 'bg-red-500/10 text-red-300 border-red-500/30 print:bg-red-100 print:text-red-800 print:border-red-200',
  high:     'bg-orange-500/10 text-orange-300 border-orange-500/30 print:bg-orange-100 print:text-orange-800 print:border-orange-200',
  medium:   'bg-amber-500/10 text-amber-300 border-amber-500/30 print:bg-amber-100 print:text-amber-800 print:border-amber-200',
  low:      'bg-surface-raised text-subtle border-border',
}

export default function FindingCard({ finding, variant = 'full' }: Props) {
  const style = CLASSIFICATION_STYLE[finding.classification]
  const compact = variant === 'compact'
  const tier = priorityTier(finding)
  const weakEvidence = !compact && hasWeakEvidenceSupport(finding)

  const citations = compact ? finding.citations.slice(0, 1) : finding.citations
  const recommendations = compact ? finding.recommendations.slice(0, 1) : finding.recommendations

  return (
    <div className={`border rounded-xl px-5 py-5 flex flex-col gap-4 ${style.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold uppercase tracking-wide ${style.labelColor}`}>
                {style.icon} {style.label}
              </span>
              {!compact && finding.classification !== 'compliant' && (
                <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${PRIORITY_STYLE[tier]}`}>
                  {tier}
                </span>
              )}
              <span className="text-xs text-subtle">{finding.area_name}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground leading-snug">{finding.title}</h3>
          </div>
        </div>
        <ConfidenceBadge level={finding.confidence} />
      </div>

      <p className="text-sm text-muted leading-relaxed pl-4">{finding.what_found}</p>
      {!compact && <p className="text-sm text-subtle leading-relaxed pl-4">{finding.why_matters}</p>}

      {finding.confidence_reasoning && (
        <p className="text-xs text-subtle leading-relaxed pl-4">
          <span className="font-semibold text-muted">Why this confidence: </span>
          {finding.confidence_reasoning}
        </p>
      )}

      {weakEvidence && (
        <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 ml-4 print:text-amber-800 print:bg-amber-50 print:border-amber-200">
          ⚠️ This finding claims {finding.confidence} confidence but lists no specific supporting evidence below — treat with extra caution before acting on it.
        </p>
      )}

      {!compact && (finding.evidence_found.length > 0 || finding.evidence_missing.length > 0 || finding.inference_made) && (
        <div className="pl-4 flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-xs font-semibold text-muted">Evidence → Citation trail</span>

          {finding.evidence_found.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-emerald-300 print:text-emerald-700">Detected</span>
              <ul className="list-disc list-inside">
                {finding.evidence_found.map((e, i) => (
                  <li key={i} className="text-xs text-muted">{e}</li>
                ))}
              </ul>
            </div>
          )}

          {finding.evidence_missing.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-amber-300 print:text-amber-700">Not detected / unconfirmed</span>
              <ul className="list-disc list-inside">
                {finding.evidence_missing.map((e, i) => (
                  <li key={i} className="text-xs text-muted">{e}</li>
                ))}
              </ul>
            </div>
          )}

          {finding.inference_made && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted">Inferred (and why)</span>
              <p className="text-xs text-muted">{finding.inference_made}</p>
            </div>
          )}
        </div>
      )}

      {citations.length > 0 && (
        <div className="pl-4 flex flex-col gap-2">
          {!compact && (
            <span className="text-xs font-medium text-muted">
              ↳ Traced to source clause{citations.length === 1 ? '' : 's'}
            </span>
          )}
          {citations.map((citation, i) => (
            <CitationBlock key={i} citation={citation} />
          ))}
        </div>
      )}

      {finding.impacts.length > 0 && (
        <div className="pl-4 flex flex-col gap-1.5">
          {finding.impacts.map((impact, j) => (
            <div key={j} className="flex items-start gap-2">
              <span className="text-xs font-semibold text-subtle w-20 shrink-0 mt-0.5 uppercase tracking-wide">
                {LENS_LABEL[impact.lens]}
              </span>
              <span className="text-xs text-muted">{impact.description}</span>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="pl-4 pt-1 border-t border-border flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted">
            {compact ? 'Recommended:' : 'Recommendations:'}
          </span>
          {compact ? (
            <p className="text-xs text-subtle">{recommendations[0]}</p>
          ) : (
            <ul className="list-disc list-inside">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-subtle">{rec}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
