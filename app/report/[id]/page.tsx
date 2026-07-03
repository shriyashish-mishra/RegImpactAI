// Report page — server component.
// Reads the assessment and its findings from Postgres via lib/report/mapper
// and renders the full regulatory impact assessment report.

import Link from 'next/link'
import { buildReport } from '@/lib/report/mapper'
import ReportView from '@/components/report/ReportView'
import PrintButton from '@/components/report/PrintButton'
import SiteHeader from '@/components/shell/SiteHeader'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params
  const result = await buildReport(id)

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-col gap-3">
            <h1 className="text-xl font-semibold text-foreground">Assessment not found</h1>
            <p className="text-muted text-sm">
              No assessment exists with id{' '}
              <span className="font-mono text-xs bg-surface px-1.5 py-0.5 rounded">{id}</span>.
            </p>
            <Link href="/" className="text-sm font-medium text-accent hover:underline underline-offset-2 w-fit">
              Start a new assessment →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden mx-auto max-w-4xl px-6 pt-6 flex justify-end">
        <PrintButton />
      </div>
      <ReportView report={result.report} />
    </div>
  )
}
