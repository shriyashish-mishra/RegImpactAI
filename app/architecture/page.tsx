import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/shell/SiteHeader'
import SectionLabel from '@/components/primitives/SectionLabel'

const TITLE = 'Architecture — RegImpact AI'
const DESCRIPTION = 'How RegImpact AI is built, end to end.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const PIPELINE = [
  { step: 'Describe',   route: '/api/synthesize' },
  { step: 'Understand', route: 'client-only' },
  { step: 'Discover',   route: '/api/questions' },
  { step: 'Assess',     route: '/api/generate' },
  { step: 'Report',     route: '/report/[id]' },
]

const TABLES = [
  { name: 'assessments',        detail: 'id, product_name, description, created_at.' },
  { name: 'questions',          detail: 'Discovery Q&A per assessment, persisted as answered.' },
  { name: 'findings',           detail: 'One row per clause tested — classification, confidence, evidence found/missing.' },
  { name: 'finding_impacts',    detail: 'Product / UI / engineering / business impact statements.' },
  { name: 'finding_citations',  detail: 'Source clause(s) per finding, joined by id, verified flag resolved server-side.' },
  { name: 'recommendations',    detail: 'Ordered, actionable recommendations per finding.' },
  { name: 'daily_usage',        detail: 'One row per calendar date — the shared Gemini-call quota counter.' },
]

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current="architecture" />

      <div className="mx-auto max-w-4xl px-6 py-16 flex flex-col gap-16">

        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Architecture
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground tracking-tight">
            How it&apos;s built
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Next.js App Router on the frontend, three Gemini-calling API routes in the middle,
            Supabase (Postgres) for persistence. No custom backend service — the route handlers
            are the backend.
          </p>
        </div>

        <section className="flex flex-col gap-5">
          <SectionLabel index={1} label="Pipeline" />
          <div className="flex flex-wrap items-stretch gap-2">
            {PIPELINE.map((item, i) => (
              <div key={item.step} className="flex items-center gap-2">
                <div className="flex flex-col gap-1 px-4 py-3 bg-surface border border-border rounded-xl min-w-32">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">Stage {i + 1}</span>
                  <span className="text-sm font-medium text-foreground">{item.step}</span>
                  <code className="text-[10px] font-mono text-accent">{item.route}</code>
                </div>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight size={16} className="text-subtle shrink-0" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={2} label="Streaming" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            <code className="text-xs font-mono bg-surface px-1.5 py-0.5 rounded text-accent">/api/generate</code>{' '}
            responds with NDJSON — one JSON event per line, each a{' '}
            <code className="text-xs font-mono bg-surface px-1.5 py-0.5 rounded text-accent">step</code>,{' '}
            <code className="text-xs font-mono bg-surface px-1.5 py-0.5 rounded text-accent">finding</code>,{' '}
            <code className="text-xs font-mono bg-surface px-1.5 py-0.5 rounded text-accent">done</code>, or{' '}
            <code className="text-xs font-mono bg-surface px-1.5 py-0.5 rounded text-accent">error</code> event.
            The client reads the response body as a stream and renders findings as they arrive.
            <code className="text-xs font-mono bg-surface px-1.5 py-0.5 rounded text-accent"> step</code>{' '}
            messages narrate real server-side stages — corpus retrieval, per-citation verification,
            report assembly — not a simulated progress bar.
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabel index={3} label="Data Model" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TABLES.map(table => (
              <div key={table.name} className="flex flex-col gap-1 px-4 py-3 bg-surface border border-border rounded-lg">
                <code className="text-xs font-mono text-accent">{table.name}</code>
                <span className="text-xs text-muted leading-relaxed">{table.detail}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-subtle leading-relaxed">
            The regulatory corpus itself is not in Postgres — it&apos;s a curated array in{' '}
            <code className="font-mono bg-surface px-1 py-0.5 rounded text-accent">lib/corpus.ts</code>, filtered by area code.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={4} label="Retrieval" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Not embeddings-based semantic search — the corpus is 19 clauses total, small enough
            that every clause for a triggered area (<code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">DLG</code> +{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">KYC_AML</code>) goes to the model directly,
            every time — no relevance-ranking step that could silently drop a clause. A deliberate
            choice at this scale, not a glossed-over limitation: the report shows a verdict for
            every clause considered, not a curated subset. Would need to change if the corpus grew
            into the hundreds of clauses; it hasn&apos;t yet.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={5} label="Cost Protection" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Every Gemini-calling route checks and atomically increments a shared daily counter in{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">daily_usage</code>{' '}
            before calling Gemini — never after. Once the configured limit is reached, the request
            is refused with no Gemini call made at all, and the UI shows a countdown to RegImpact&apos;s
            own reset time rather than a raw error. Configurable via{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">MAX_DAILY_ASSESSMENTS</code>, no code
            change needed.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={6} label="Current Scope" />
          <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-200 leading-relaxed">
              Two regulatory areas — DLG and KYC/AML — have corpus clauses to test against today.
              The product model may reference PPI as &ldquo;in scope&rdquo;, but no findings are
              ever generated for it — nothing in the corpus tests it. A deliberate MVP boundary:
              prove the citation-verification approach end to end before expanding further.
            </p>
          </div>
          <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-200 leading-relaxed">
              The KYC/AML clauses specifically are <strong>unverified</strong> — reconstructed from
              general knowledge, not transcribed from the current source document. DLG clauses are
              verbatim and fully verified. Every citation carries this flag; unverified ones render
              an explicit &ldquo;needs legal review&rdquo; notice. Don&apos;t rely on a KYC/AML
              finding for an actual compliance decision.
            </p>
          </div>
        </section>

        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <Link href="/demo/sample" className="text-sm font-medium text-accent hover:underline underline-offset-2">
            See a completed assessment →
          </Link>
          <Link href="/case-study" className="text-sm font-medium text-subtle hover:text-foreground underline underline-offset-2">
            Read the case study →
          </Link>
        </div>

      </div>
    </div>
  )
}
