// Presentational report body — shared by the real report page
// (app/report/[id]/page.tsx) and the static sample demo (app/demo/sample/page.tsx).
// Takes assembled ReportData; has no idea whether it came from Postgres or a fixture.

import type { ReportData } from '@/lib/report/mapper'
import FindingCard from '@/components/report/FindingCard'

type Props = {
  report: ReportData
}

export default function ReportView({ report }: Props) {
  const { assessment, findings } = report

  const compliant     = findings.filter(f => f.classification === 'compliant')
  const nonCompliant  = findings.filter(f => f.classification === 'non_compliant')
  const potentialGap  = findings.filter(f => f.classification === 'potential_gap')
  const infoRequired  = findings.filter(f => f.classification === 'info_required')
  const flagged       = [...nonCompliant, ...potentialGap, ...infoRequired]

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-10">

      <div className="flex flex-col gap-3 pb-6 border-b border-slate-200">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
          Regulatory Impact Assessment
        </span>
        <h1 className="text-2xl font-semibold text-slate-900">{assessment.product_name}</h1>
        <p className="text-sm text-slate-500 leading-relaxed">{assessment.description}</p>
        <p className="text-xs text-slate-500">
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
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-slate-600">{findings.length} clause{findings.length === 1 ? '' : 's'} assessed</span>
            {compliant.length > 0 && <span className="text-emerald-700">✅ {compliant.length} compliant</span>}
            {nonCompliant.length > 0 && <span className="text-red-600">❌ {nonCompliant.length} non-compliant</span>}
            {potentialGap.length > 0 && <span className="text-amber-600">⚠️ {potentialGap.length} potential gap{potentialGap.length === 1 ? '' : 's'}</span>}
            {infoRequired.length > 0 && <span className="text-slate-500">❓ {infoRequired.length} info required</span>}
          </div>
        )}
      </div>

      {flagged.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-900">Findings requiring attention</h2>
          {flagged.map(finding => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      )}

      {compliant.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-900">Confirmed compliant</h2>
          {compliant.map(finding => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      )}

    </div>
  )
}
