// Zero-setup sample demo — renders a static, pre-built ReportData fixture
// (lib/demo/sampleReport.ts) through the same ReportView used by the real
// report page. No Supabase call, no AI inference call — works with no env
// vars configured, so a reviewer can see a finished report immediately.

import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/shell/SiteHeader'
import ReportView from '@/components/report/ReportView'
import PrintButton from '@/components/report/PrintButton'
import AssessmentJourney from '@/components/report/AssessmentJourney'
import { Badge } from '@/components/ui/badge'
import { SAMPLE_REPORT } from '@/lib/demo/sampleReport'
import { JOURNEY_STRUCTURED_INFO, JOURNEY_DESCRIPTION, JOURNEY_INFERRED_ELEMENTS, JOURNEY_QUESTIONS } from '@/lib/demo/sampleJourney'
import { getClausesByAreaCode } from '@/lib/corpus'
import { getAssessableAreaCodes } from '@/lib/categoryMapping'

const journeyAreaCodes = getAssessableAreaCodes(JOURNEY_STRUCTURED_INFO.categories)
const journeyClauseCount = journeyAreaCodes.reduce((sum, code) => sum + getClausesByAreaCode(code).length, 0)

const TITLE = 'Sample Report — RegImpact AI'
const DESCRIPTION = 'A zero-setup sample regulatory impact assessment — no API keys needed.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

export default function SampleDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden">
        <SiteHeader current="sample" />

        <div className="mx-auto max-w-3xl px-6 pt-8">
          <p className="text-xs text-muted bg-surface border border-border rounded-lg px-4 py-3 leading-relaxed">
            This is a static sample report — no API calls, no setup required. Its findings cite
            real clauses from the same regulatory corpus the live assessment flow uses. A live
            example of AI-powered RegTech: retrieval-augmented findings, citation verification, and
            an explainable evidence trail on every line.{' '}
            <Link href="/" className="text-accent hover:underline">
              Try the real flow →
            </Link>
          </p>
          <div className="flex flex-wrap gap-2 pt-3">
            {['Retrieval-Augmented Generation', 'Citation Verification', 'Explainable AI', 'Executive Reporting'].map(tag => (
              <Badge key={tag} variant="outline" className="rounded-full text-[10px]">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="print:hidden mx-auto max-w-3xl px-6 pt-6">
        <AssessmentJourney
          structuredInfo={JOURNEY_STRUCTURED_INFO}
          description={JOURNEY_DESCRIPTION}
          inferredElements={JOURNEY_INFERRED_ELEMENTS}
          questions={JOURNEY_QUESTIONS}
          findings={SAMPLE_REPORT.findings}
          areaCount={journeyAreaCodes.length}
          clauseCount={journeyClauseCount}
        />
      </div>

      <div className="print:hidden mx-auto max-w-3xl px-6 pt-6 flex justify-end">
        <PrintButton />
      </div>

      <ReportView report={SAMPLE_REPORT} />
    </div>
  )
}
