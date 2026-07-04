import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/shell/SiteHeader'
import SectionLabel from '@/components/primitives/SectionLabel'
import { Badge } from '@/components/ui/badge'

const TITLE = 'Architecture — RegImpact AI'
const DESCRIPTION = 'How RegImpact AI is built, end to end.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const LAYERS = [
  {
    name: 'Structured Inputs',
    what: 'Multi-select onboarding — categories, geographies, customer segments, regulated entities, capabilities.',
    why: 'Ground truth the system never has to guess at. Fewer inferred assumptions means fewer places for an AI reasoning error to enter the pipeline in the first place.',
  },
  {
    name: 'Rule Engine',
    what: 'Two plain, no-AI lookups: which regulatory areas even apply to the declared categories (lib/categoryMapping.ts), and — per clause — whether anything in the structured inputs or description even touches its subject matter (lib/ruleEngine). A clause with zero signal is resolved right there as "insufficient information," never sent to the model.',
    why: 'Deliberately narrow: it can only ever conclude "nothing to test," never "compliant" — mentioning a topic doesn\'t confirm the regulation\'s actual terms are met, so that judgment always goes to real reasoning. What it CAN decide safely, it decides for free, shrinking every downstream AI prompt for products with a small structured footprint.',
  },
  {
    name: 'Assessment Cache',
    what: 'Each of the three AI-calling stages (understand, discover, assess) checks a cache keyed on a hash of its normalized inputs before calling the model at all. A hit returns instantly and costs nothing against the daily AI quota; a miss calls the model once and stores the result.',
    why: 'The single biggest lever for "AI calls prevented" — rules shrink a prompt, but a cache hit skips the call entirely. Versioned by prompt/rule/corpus/schema version, so a bump to any of them makes old entries simply stop matching new lookups — nothing is ever deleted, and a stale result is never returned as current.',
  },
  {
    name: 'AI Inference Layer',
    what: 'One abstraction (lib/ai/provider.ts) behind every model call — understanding the product, adaptive discovery, and assessment all route through it.',
    why: 'The reasoning work — reading a product description, deciding what\'s still unclear, testing it against regulatory text — is language work only a model does well. The provider behind it is swappable and never exposed.',
  },
  {
    name: 'Adaptive Discovery',
    what: 'Targeted follow-up questions, scoped to exactly what structured inputs and inferred elements don\'t already cover.',
    why: 'A static intake form asks the same twenty questions regardless of the product. This asks the 3-5 that would actually change the compliance answer — better signal, less user effort.',
  },
  {
    name: 'Citation Verification',
    what: 'Every citation\'s verified flag, document version, publication date, and issuing authority are all resolved server-side against the Regulatory Knowledge Base — never taken from the model\'s own output.',
    why: 'A model can misquote or paraphrase confidently. Resolving this server-side means a citation can\'t inherit trust — or metadata — it hasn\'t earned, no matter how the model presents it.',
  },
  {
    name: 'Assessment Engine',
    what: 'Every clause in scope is classified — compliant, non-compliant, potential gap, or info required — not just the ones that look like problems.',
    why: 'A report that only ever lists problems can\'t be checked against confirmations, and can\'t produce a real compliance score.',
  },
  {
    name: 'Executive Report',
    what: 'Compliance score, risk level, and launch recommendation are computed deterministically from the classified findings — no AI call.',
    why: 'A number a reviewer will act on should come from arithmetic they can audit, not a second round of model judgment.',
  },
]

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
  { name: 'finding_citations',  detail: 'Source clause(s) per finding, joined by id — verified flag, document version, publication date, and authority all resolved server-side.' },
  { name: 'recommendations',    detail: 'Ordered, actionable recommendations per finding.' },
  { name: 'daily_usage',        detail: 'One row per calendar date — the shared AI-inference quota counter.' },
  { name: 'ai_cache',           detail: 'Stage-level cache of AI responses, keyed by normalized input hash + prompt/rule/corpus/schema version.' },
  { name: 'ai_optimization_metrics', detail: 'One row per calendar date — cache hits/misses, rule engine decisions, token/time savings.' },
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
            This isn&apos;t a single prompt with a chat interface on top. A rule engine and a
            request cache both sit in front of every AI call, deciding what actually needs a model
            at all — AI reasoning is the last resort in this pipeline, not the first step.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['System Design', 'RAG', 'AI Orchestration', 'Explainable AI', 'Audit Trail'].map(tag => (
              <Badge key={tag} variant="outline" className="rounded-full">{tag}</Badge>
            ))}
          </div>
        </div>

        <section className="flex flex-col gap-5">
          <SectionLabel index={1} label="System Design" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Eight layers, each with one job. AI reasoning only ever runs where language
            understanding is genuinely needed — everything decidable by a plain rule, or already
            computed once before, is resolved without it.
          </p>
          <div className="flex flex-col gap-2">
            {LAYERS.map((layer, i) => (
              <div key={layer.name} className="flex items-start gap-3 px-4 py-3 bg-surface border border-border rounded-lg">
                <span className="w-6 h-6 rounded-full bg-surface-raised text-accent text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">{layer.name}</span>
                  <span className="text-xs text-muted leading-relaxed">{layer.what}</span>
                  <span className="text-xs text-subtle leading-relaxed">{layer.why}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabel index={2} label="Request Pipeline" />
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
          <SectionLabel index={3} label="Streaming" />
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
          <SectionLabel index={4} label="Data Model" />
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
            <code className="font-mono bg-surface px-1 py-0.5 rounded text-accent">lib/corpus.ts</code>, each clause tagged
            to a document in the Regulatory Knowledge Base below, filtered to that document&apos;s area.
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabel index={5} label="Regulatory Knowledge Base" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            A regulation isn&apos;t one static file — RBI amends, clarifies, and circulars its
            guidelines continuously. Treating &ldquo;Digital Lending Guidelines, 2022&rdquo; as a
            single hardcoded document breaks the moment an amendment needs to be added. So the
            corpus is organized as a Knowledge Base instead: each regulatory area (Digital Lending,
            KYC/AML today; PPI, Payment Aggregator, Account Aggregator, NBFC, and UPI are modeled
            as areas but have no documents behind them yet — see{' '}
            <Link href="/knowledge-base" className="text-accent hover:underline">the Knowledge Base page</Link>) can hold
            multiple documents — a guideline, its circulars, amendments, FAQs — and each document
            carries real lifecycle metadata: type, version, status, publication date, issuing
            authority, and supersession links to whatever it replaced or was replaced by.
          </p>
          <div className="flex flex-col gap-2">
            {[
              { name: 'Document Metadata', detail: 'title, authority, area, document type, publication/effective date, version, status, jurisdiction, source, last reviewed, supersedes/superseded by, verified — the same shape for any future authority, nothing RBI-specific in the type itself.' },
              { name: 'Corpus', detail: 'every clause references a document_id, not an area directly — an area can hold several documents even though DLG and KYC/AML each have exactly one today.' },
              { name: 'Retrieval', detail: 'filters to clauses whose document is currently active — mark a document superseded and it drops out of assessments automatically, no code change.' },
              { name: 'Citation Verification', detail: 'every citation resolves its document\'s version, publication date, and authority server-side, alongside the existing verified flag.' },
              { name: 'Assessment', detail: 'unchanged behavior end to end — the pipeline never needed to know this restructuring happened underneath it.' },
            ].map(item => (
              <div key={item.name} className="flex items-start gap-3 px-4 py-3 bg-surface border border-border rounded-lg">
                <span className="text-sm font-medium text-foreground w-40 shrink-0">{item.name}</span>
                <span className="text-xs text-muted leading-relaxed">{item.detail}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-subtle leading-relaxed">
            Why this shape: it&apos;s the difference between a demo that tests one PDF and a
            platform that can absorb regulatory evolution, keep version history instead of
            overwriting it, stay fully traceable per citation, and extend to a new authority (SEBI,
            IRDAI, NPCI, the DPDP Act, or a non-Indian regulator) as new data, not a redesign.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={6} label="Retrieval" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Not embeddings-based semantic search — retrieval happens in two direct filters, no
            ranking step. First, the product&apos;s declared categories (multi-select) decide which
            regulatory areas are worth testing at all — a{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">Payments</code> product only pulls{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">KYC_AML</code>, while a product
            categorized as both{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">Digital Lending</code> and{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">Payments</code> pulls the union —{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">DLG</code> +{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">KYC_AML</code> — deduplicated (see{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">lib/categoryMapping.ts</code>).
            Adding a category can only ever add area codes, never remove one another selected
            category already required. Second, within those areas, only clauses belonging to a
            currently <strong>active</strong> document in the Knowledge Base go to the model — 19
            clauses across two active documents today. The report shows a verdict for every clause
            actually in scope, not a curated subset an approximate retrieval step might have dropped.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={7} label="AI Inference Layer" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Every route that needs the AI inference engine calls it through one abstraction —{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">lib/ai/provider.ts</code> — instead
            of importing a specific model provider&apos;s SDK directly. Routes, prompts, Zod
            schemas, and every UI surface only ever know they&apos;re talking to &ldquo;the AI
            inference engine&rdquo;; which model actually answers is an implementation detail
            confined to that one file. Swapping the underlying provider means changing that file
            alone — nothing in the assessment pipeline, admin dashboard, or this page would need
            to change.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={8} label="Cost Protection" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Every AI-inference-calling route checks and atomically increments a shared daily
            counter in{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">daily_usage</code>{' '}
            before calling the inference engine — never after. Once the configured limit is
            reached, the request is refused with no inference call made at all, and the UI shows a
            countdown to RegImpact&apos;s own reset time rather than a raw error. Configurable via{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">MAX_DAILY_ASSESSMENTS</code>, no code
            change needed. A cache hit or a rule-engine decision never reaches this counter at all —
            since no AI call happened, none of the daily budget is spent on it.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={9} label="MVP Scope & Scaling Path" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Two regulatory areas have active documents behind them today — Digital Lending
            (the 2022 Guidelines) and KYC/AML (the 2016 Master Direction) — chosen deliberately,
            not as a shortcut. Digital Lending is where citation-verification actually gets
            exercised hardest (disbursal mechanics, cooling-off periods, fee rules), and KYC/AML is
            the one obligation almost every fintech category triggers regardless of what else it
            does. Proving the trust mechanism on these two first, end to end, matters more than
            shipping shallow coverage across many. PPI, Payment Aggregator, Account Aggregator,
            NBFC, and UPI already exist as areas in the Knowledge Base registry — a product model
            may show one as &ldquo;in scope&rdquo; based on what the description implies, which is
            an honest reflection of the product, not a claim about what&apos;s assessed. No
            findings are generated for them; there&apos;s no document behind them yet.
          </p>
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Scaling is additive at every level, not a rework: a new circular or amendment is one
            new document in the registry, tagged with its own clauses; a new regulatory area
            (SEBI, IRDAI, NPCI, the DPDP Act) is a new registry entry with its own authority; a new
            product category mapping to an existing area is one row in{' '}
            <code className="text-xs font-mono bg-surface px-1 py-0.5 rounded text-accent">lib/categoryMapping.ts</code>. None
            of it touches retrieval, discovery, or assessment logic. The same is true for
            jurisdictions: geography is already a first-class, multi-select onboarding field, ready
            for regulatory corpora beyond India.
          </p>
          <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-200 leading-relaxed">
              One honest caveat this scope decision comes with: the KYC/AML clauses are{' '}
              <strong>unverified</strong> — reconstructed from general regulatory knowledge, not
              transcribed from the current source document, unlike the verbatim, fully verified DLG
              clauses. Every citation carries this distinction through to the report; unverified
              ones render an explicit &ldquo;needs legal review&rdquo; notice rather than being
              presented as equally trustworthy. Don&apos;t rely on a KYC/AML finding for an actual
              compliance decision until that verification work is done.
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
