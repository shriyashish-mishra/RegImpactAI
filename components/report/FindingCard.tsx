// Shared finding card — used by both the live-streaming preview
// (GeneratingScreen) and the full report (ReportView). Previously these two
// components hand-rolled near-identical markup independently; consolidated
// here so the classification/evidence UI added for explainability only has
// one place to live.

import type { Finding, FindingClassification } from '@/lib/types'
import ConfidenceBadge from '@/components/primitives/ConfidenceBadge'
import CitationBlock   from '@/components/primitives/CitationBlock'

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

const CLASSIFICATION_STYLE: Record<FindingClassification, {
  border: string
  dot: string
  icon: string
  label: string
  labelColor: string
}> = {
  compliant:     { border: 'border-emerald-200 bg-emerald-50', dot: 'bg-emerald-500', icon: '✅', label: 'Compliant',     labelColor: 'text-emerald-700' },
  non_compliant: { border: 'border-red-200 bg-red-50',         dot: 'bg-red-500',     icon: '❌', label: 'Non-Compliant', labelColor: 'text-red-700' },
  potential_gap: { border: 'border-amber-200 bg-amber-50',     dot: 'bg-amber-400',   icon: '⚠️', label: 'Potential Gap', labelColor: 'text-amber-700' },
  info_required: { border: 'border-slate-200 bg-slate-50',     dot: 'bg-slate-400',   icon: '❓', label: 'Info Required', labelColor: 'text-slate-600' },
}

export default function FindingCard({ finding, variant = 'full' }: Props) {
  const style = CLASSIFICATION_STYLE[finding.classification]
  const compact = variant === 'compact'

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
              <span className="text-xs text-slate-400">{finding.area_name}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 leading-snug">{finding.title}</h3>
          </div>
        </div>
        <ConfidenceBadge level={finding.confidence} />
      </div>

      <p className="text-sm text-slate-600 leading-relaxed pl-4">{finding.what_found}</p>
      {!compact && <p className="text-sm text-slate-500 leading-relaxed pl-4">{finding.why_matters}</p>}

      {finding.confidence_reasoning && (
        <p className="text-xs text-slate-500 leading-relaxed pl-4">
          <span className="font-semibold text-slate-600">Why this confidence: </span>
          {finding.confidence_reasoning}
        </p>
      )}

      {!compact && (finding.evidence_found.length > 0 || finding.evidence_missing.length > 0 || finding.inference_made) && (
        <div className="pl-4 flex flex-col gap-2 border-t border-black/5 pt-3">
          <span className="text-xs font-semibold text-slate-600">Reasoning</span>

          {finding.evidence_found.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-emerald-700">Evidence found</span>
              <ul className="list-disc list-inside">
                {finding.evidence_found.map((e, i) => (
                  <li key={i} className="text-xs text-slate-600">{e}</li>
                ))}
              </ul>
            </div>
          )}

          {finding.evidence_missing.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-amber-700">Evidence missing</span>
              <ul className="list-disc list-inside">
                {finding.evidence_missing.map((e, i) => (
                  <li key={i} className="text-xs text-slate-600">{e}</li>
                ))}
              </ul>
            </div>
          )}

          {finding.inference_made && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-slate-600">Inference made</span>
              <p className="text-xs text-slate-600">{finding.inference_made}</p>
            </div>
          )}
        </div>
      )}

      {finding.impacts.length > 0 && (
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
      )}

      {recommendations.length > 0 && (
        <div className="pl-4 pt-1 border-t border-black/5 flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">
            {compact ? 'Recommended:' : 'Recommendations:'}
          </span>
          {compact ? (
            <p className="text-xs text-slate-500">{recommendations[0]}</p>
          ) : (
            <ul className="list-disc list-inside">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-slate-500">{rec}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {citations.length > 0 && (
        <div className="pl-4 flex flex-col gap-2">
          {citations.map((citation, i) => (
            <CitationBlock key={i} citation={citation} />
          ))}
        </div>
      )}
    </div>
  )
}
