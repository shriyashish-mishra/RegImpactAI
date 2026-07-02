// Report page — server component.
// Reads the assessment and its findings from Postgres via lib/report/mapper
// and renders the full regulatory impact assessment report.

import { buildReport } from '@/lib/report/mapper'
import ReportView from '@/components/report/ReportView'
import PrintButton from '@/components/report/PrintButton'

type Props = {
  params: Promise<{ id: string }>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="print:hidden mx-auto max-w-3xl px-6 pt-6 flex justify-end">
        <PrintButton />
      </div>
      <ReportView report={result.report} />
    </div>
  )
}
