// Report page — server component.
// Reads the assessment and its findings from Postgres via lib/report/mapper
// and renders the full regulatory impact assessment report.

import { buildReport } from '@/lib/report/mapper'
import ConfidenceBadge from '@/components/primitives/ConfidenceBadge'
import CitationBlock   from '@/components/primitives/CitationBlock'

type Props = {
  params: Promise<{ id: string }>
}

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

export default async function ReportPage({ params }: Props) {
  const { id } = await params
  const result = await buildReport(id)

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-col gap-3">
            <h1 className="text-xl font-semibold text-slate-900">Assessment not found</h1>
            <p className="text-slate-500 text-sm">
              No assessment exists with id{' '}
              <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{id}</span>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { assessment, findings } = result.report
  const high = findings.filter(f => f.severity === 'high').length
  const medium = findings.filter(f => f.severity === 'medium').length
  const low = findings.filter(f => f.severity === 'low').length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-10">

        <div className="flex flex-col gap-3 pb-6 border-b border-slate-200">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            Regulatory Impact Assessment
          </span>
          <h1 className="text-2xl font-semibold text-slate-900">{assessment.product_name}</h1>
          <p className="text-sm text-slate-500 leading-relaxed">{assessment.description}</p>
          <p className="text-xs text-slate-400">
            Assessment <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{assessment.id}</span>
            {' · '}
            {new Date(assessment.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Summary</h2>
          {findings.length === 0 ? (
            <p className="text-sm text-slate-500">
              No findings were identified for the applicable regulatory areas.
            </p>
          ) : (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600">{findings.length} finding{findings.length === 1 ? '' : 's'}</span>
              {high > 0 && <span className="text-red-600">{high} high</span>}
              {medium > 0 && <span className="text-amber-600">{medium} medium</span>}
              {low > 0 && <span className="text-slate-500">{low} low</span>}
            </div>
          )}
        </div>

        {findings.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-slate-900">Findings</h2>
            {findings.map(finding => (
              <div key={finding.id} className={`border rounded-xl px-5 py-5 flex flex-col gap-4 ${SEVERITY_BORDER[finding.severity]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${SEVERITY_DOT[finding.severity]}`} />
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug">{finding.title}</h3>
                      <span className="text-xs text-slate-400">{finding.area_name}</span>
                    </div>
                  </div>
                  <ConfidenceBadge level={finding.confidence} />
                </div>

                <p className="text-sm text-slate-600 leading-relaxed pl-4">{finding.what_found}</p>
                <p className="text-sm text-slate-500 leading-relaxed pl-4">{finding.why_matters}</p>

                {finding.impacts.length > 0 && (
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
                )}

                {finding.recommendations.length > 0 && (
                  <div className="pl-4 pt-1 border-t border-black/5 flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-600">Recommendations:</span>
                    <ul className="list-disc list-inside">
                      {finding.recommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-slate-500">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {finding.citations.length > 0 && (
                  <div className="pl-4 flex flex-col gap-2">
                    {finding.citations.map((citation, i) => (
                      <CitationBlock key={i} citation={citation} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
