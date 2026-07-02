// Zero-setup sample demo — renders a static, pre-built ReportData fixture
// (lib/demo/sampleReport.ts) through the same ReportView used by the real
// report page. No Supabase call, no Anthropic call — works with no env
// vars configured, so a reviewer can see a finished report immediately.

import type { Metadata } from 'next'
import SiteHeader from '@/components/shell/SiteHeader'
import ReportView from '@/components/report/ReportView'
import { SAMPLE_REPORT } from '@/lib/demo/sampleReport'

export const metadata: Metadata = {
  title: 'Sample Report — RegImpact AI',
  description: 'A zero-setup sample regulatory impact assessment.',
}

export default function SampleDemoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader current="sample" />

      <div className="mx-auto max-w-3xl px-6 pt-8">
        <p className="text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 leading-relaxed">
          This is a static sample report — no API calls, no setup required. Its findings cite
          real clauses from the same regulatory corpus the live assessment flow uses.{' '}
          <a href="/" className="text-indigo-600 hover:underline">
            Try the real flow →
          </a>
        </p>
      </div>

      <ReportView report={SAMPLE_REPORT} />
    </div>
  )
}
