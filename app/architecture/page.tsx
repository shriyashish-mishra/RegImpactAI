import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/shell/SiteHeader'

const TITLE = 'Architecture — RegImpact AI'
const DESCRIPTION = 'How RegImpact AI is built, end to end.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const PIPELINE = [
  { step: 'Describe',   route: 'POST /api/synthesize', detail: "Takes a free-text product description, calls Gemini to infer a product model and which regulatory areas are triggered, and creates the assessment row in Postgres." },
  { step: 'Understand', route: '(client-only)',         detail: 'The inferred model is mirrored back to the user for confirmation. No network call — confirming just relabels the client-side model.' },
  { step: 'Discover',   route: 'POST /api/questions',   detail: 'Given the confirmed model, Gemini generates 3–5 clarifying questions scoped to the regulatory areas the corpus can actually test against.' },
  { step: 'Assess',     route: 'POST /api/generate',    detail: 'Tests the confirmed model and discovery answers against the relevant corpus clauses, persists each finding (with its impacts, citations, and recommendations), and streams progress back to the client.' },
  { step: 'Report',     route: 'GET /report/[id]',      detail: 'A server component reads the assessment and its findings from Postgres and renders the full report.' },
]

const TABLES = [
  { name: 'assessments',        detail: 'One row per submitted product description: id, product_name, description, created_at.' },
  { name: 'findings',           detail: 'One row per finding: area, title, what/why, severity, confidence — foreign-keyed to assessments.' },
  { name: 'finding_impacts',    detail: 'Product / UI / engineering / business impact statements, one-to-many per finding.' },
  { name: 'finding_citations',  detail: 'The regulatory clause(s) backing a finding — clause text is denormalised for display but joined to the source corpus clause by id.' },
  { name: 'recommendations',    detail: 'Ordered, actionable recommendations per finding.' },
]

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader current="architecture" />

      <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-12">

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            Architecture
          </span>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            How it&apos;s built
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Next.js App Router on the frontend, three Gemini-calling API routes in the middle,
            Supabase (Postgres) for persistence. No custom backend service — the route handlers
            are the backend.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Pipeline
          </h2>
          <div className="flex flex-col gap-2">
            {PIPELINE.map((item, i) => (
              <div key={item.step} className="flex items-start gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{item.step}</span>
                    <code className="text-xs font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{item.route}</code>
                  </div>
                  <span className="text-xs text-slate-500 leading-relaxed">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Streaming
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">/api/generate</code>{' '}
            responds with NDJSON — one JSON event per line, each a <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">step</code>,{' '}
            <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">finding</code>,{' '}
            <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">done</code>, or{' '}
            <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">error</code> event. The client reads the
            response body as a stream, splits on newlines, and renders findings as they arrive
            rather than waiting for the full assessment.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Data model
          </h2>
          <div className="flex flex-col gap-2">
            {TABLES.map(table => (
              <div key={table.name} className="flex items-start gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg">
                <code className="text-xs font-mono text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded shrink-0">{table.name}</code>
                <span className="text-xs text-slate-500 leading-relaxed">{table.detail}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The regulatory corpus itself is not in Postgres — it&apos;s a curated array in{' '}
            <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">lib/corpus.ts</code>, filtered by area code.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Current scope
          </h2>
          <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900 leading-relaxed">
              Two regulatory areas — RBI&apos;s Digital Lending Guidelines (DLG) and KYC/AML —
              have corpus clauses to test against today. The product model and discovery
              questions may reference PPI as &ldquo;in scope&rdquo;, but no findings are ever
              generated for it, since there&apos;s nothing in the corpus to test it against.
              This is a deliberate MVP boundary, not a bug: the goal was to prove the
              citation-verification approach end to end before expanding further.
            </p>
          </div>
          <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900 leading-relaxed">
              The KYC/AML clauses specifically are <strong>unverified</strong> — reconstructed
              from general knowledge of RBI&apos;s KYC Master Direction, not transcribed from the
              current source document. The DLG clauses are verbatim excerpts and remain fully
              verified. Every citation in a report carries this flag; unverified ones render an
              explicit &ldquo;needs legal review&rdquo; notice rather than being presented as
              equally trustworthy. Don&apos;t rely on a KYC/AML finding for an actual compliance
              decision.
            </p>
          </div>
        </section>

        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <Link href="/demo/sample" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
            View a sample report →
          </Link>
          <Link href="/case-study" className="text-sm font-medium text-slate-500 hover:text-slate-700 underline underline-offset-2">
            Read the case study →
          </Link>
        </div>

      </div>
    </div>
  )
}
