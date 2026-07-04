import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, ClipboardList, Filter, Zap, Cpu, Eye, MessageSquare,
  Library, Search, ShieldCheck, ListTree, FileText, Printer,
} from 'lucide-react'
import SiteHeader from '@/components/shell/SiteHeader'
import SectionLabel from '@/components/primitives/SectionLabel'
import { Badge } from '@/components/ui/badge'

const TITLE = 'Architecture — RegImpact AI'
const DESCRIPTION = 'How RegImpact AI is built, end to end — and why.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

// The full production pipeline, in order. Every stage here is real and
// live — nothing added for narrative effect. business/technical are
// deliberately separate columns: a Principal PM reviewing this should be
// able to read just the left half and get the whole story.
const PIPELINE = [
  {
    icon: ClipboardList,
    name: 'Structured Onboarding',
    business: 'Captures ground truth up front instead of making the AI guess at facts the user already knows.',
    technical: 'Multi-select Step 1 form — categories, geographies, customer segments, regulated entities, capabilities — typed as StructuredProductInfo and trusted over any AI inference from here on.',
  },
  {
    icon: Filter,
    name: 'Rule Engine',
    business: 'Reduces unnecessary AI inference for the cases that don\'t need judgment at all.',
    technical: 'Deterministic, no-AI checks: category-to-area mapping decides which regulations even apply; per-clause keyword absence detection pre-empts clauses with zero supporting signal. Can only ever conclude "insufficient information," never fabricate a compliant verdict.',
  },
  {
    icon: Zap,
    name: 'Assessment Cache',
    business: 'Avoids recomputing identical assessments, cutting both latency and inference cost to near zero on a repeat.',
    technical: 'Each AI stage hashes its normalized inputs (case/whitespace/order-insensitive) and checks a versioned cache before calling the model — a hit skips the call and the daily quota entirely.',
  },
  {
    icon: Cpu,
    name: 'AI Inference Layer',
    business: 'Puts reasoning only where it\'s genuinely needed — reading language and judging intent, not arithmetic.',
    technical: 'One abstraction (lib/ai/provider.ts) behind every model call. Routes, prompts, and schemas only ever know "the AI inference engine" — the provider is swappable without touching business logic.',
  },
  {
    icon: Eye,
    name: 'Mirror Understanding',
    business: 'Lets the user verify the AI\'s interpretation before an assessment ever begins, catching a misread early and cheaply.',
    technical: 'Client-only screen, no network call — splits "what you told us" from "what we inferred" from "what\'s still missing," with a computed Assessment Readiness score.',
  },
  {
    icon: MessageSquare,
    name: 'Adaptive Discovery',
    business: 'Only asks the follow-up questions that would actually change the compliance answer — not a generic twenty-item intake form.',
    technical: '3-5 targeted questions generated from what structured inputs and inferred elements don\'t already cover.',
  },
  {
    icon: Library,
    name: 'Versioned Regulatory Knowledge Base',
    business: 'Separates regulatory content from business logic, so regulations can evolve without touching the pipeline.',
    technical: 'Authority → regulatory area → document → version registry (lib/knowledgeBase), each document carrying type, status, publication date, and supersession links.',
  },
  {
    icon: Search,
    name: 'Retrieval',
    business: 'Tests a product only against the regulations that actually apply to it, not the entire corpus regardless of fit.',
    technical: 'Two direct filters, no ranking: declared categories select regulatory areas, then only clauses whose document is currently Active are pulled — a superseded document drops out automatically.',
  },
  {
    icon: ShieldCheck,
    name: 'Citation Verification',
    business: 'Every finding is traceable back to real regulatory source material, not a plausible-sounding paraphrase.',
    technical: 'Verified flag, document version, publication date, and issuing authority are all resolved server-side against the Knowledge Base — never taken from the model\'s own output.',
  },
  {
    icon: ListTree,
    name: 'Finding Classification',
    business: 'Applies the same standard to every clause, so the report can show confirmations, not just problems.',
    technical: 'Every clause in scope is classified compliant, non-compliant, potential gap, or info required — structured AI output validated against a Zod schema, streamed as each finding completes.',
  },
  {
    icon: FileText,
    name: 'Executive Report Generator',
    business: 'Lets an executive understand compliance posture within seconds, not by reading every finding.',
    technical: 'Compliance score, risk level, and launch recommendation are computed deterministically from the classified findings — arithmetic, not a second round of model judgment.',
  },
  {
    icon: Printer,
    name: 'PDF Export',
    business: 'Produces a shareable, auditable deliverable a compliance team can actually file.',
    technical: 'Browser-native print with dedicated print theming — the dark UI flips to a light, paginated document automatically, no separate PDF-rendering service.',
  },
]

const WHY_DECISIONS = [
  { name: 'Rule Engine', body: 'Reduces unnecessary AI inference for deterministic cases — but is deliberately narrow: it can only conclude "nothing to test," never "compliant," since mentioning a topic doesn\'t confirm the regulation\'s actual terms are met.' },
  { name: 'Assessment Cache', body: 'Avoids recomputing identical assessments, reducing latency and inference cost — versioned so a prompt/rule/corpus change invalidates old entries automatically, never silently returning something stale.' },
  { name: 'Mirror Understanding', body: 'Lets users verify AI interpretation before an assessment begins, rather than discovering a misread three steps later in a finished report.' },
  { name: 'Adaptive Discovery', body: 'Only asks follow-up questions that would actually change a finding\'s classification — asking anything else is friction with no signal.' },
  { name: 'Versioned Regulatory Knowledge Base', body: 'Separates regulatory content from business logic, so regulations evolve independently — adding a circular or amendment is new data, not a code change.' },
  { name: 'Citation Verification', body: 'Every finding is traceable back to regulatory source material — a model can misquote confidently, so trust is resolved server-side, never taken on the model\'s word.' },
  { name: 'Executive Summary', body: 'Allows executives to understand compliance posture within seconds — a number they\'ll act on should come from auditable arithmetic, not AI self-assessment.' },
]

const KB_FLOW = [
  { name: 'Authority', detail: 'Who issues the regulation — e.g. Reserve Bank of India. A plain string, not a closed type, so a new authority (SEBI, IRDAI, NPCI) is new data.' },
  { name: 'Regulatory Area', detail: 'A domain under that authority — Digital Lending, KYC/AML, and five more areas modeled but not yet documented (PPI, Payment Aggregator, Account Aggregator, NBFC, UPI).' },
  { name: 'Documents', detail: 'One area can hold several — a guideline, its circulars, amendments, FAQs. Each is its own document with its own lifecycle.' },
  { name: 'Document Metadata', detail: 'Publication date, effective date, version, status, jurisdiction, verification status — reusable across any authority, nothing hardcoded to RBI.' },
  { name: 'Clause-Level Structure', detail: 'Documents aren\'t stored as raw text — each is pre-segmented into individually-citable clauses at authoring time. At today\'s scale (19 clauses across two documents) there\'s no automated runtime chunking step, and none is needed yet.' },
  { name: 'Retrieval', detail: 'Filters to clauses whose document is currently Active within the areas a product\'s categories select.' },
  { name: 'Citation Verification', detail: 'Every citation resolves its document\'s version, publication date, and authority — alongside the verified flag — before it ever reaches a report.' },
  { name: 'Assessment', detail: 'The pipeline consumes clauses the same way regardless of which document or version they came from — this restructuring never touched assessment logic.' },
]

const TRUST_FLOW = [
  { name: 'Finding', detail: 'One row per clause tested, classified compliant / non-compliant / potential gap / info required.' },
  { name: 'Evidence', detail: 'What was found in the product description or structured inputs, and what was missing — both recorded, not just one.' },
  { name: 'Citation', detail: 'The exact clause the finding is based on, joined by id — not free text a model could drift from.' },
  { name: 'Verification Status', detail: 'Resolved server-side from the Knowledge Base — an unverified source renders an explicit "needs legal review" notice.' },
  { name: 'Confidence Reasoning', detail: 'Why the model landed on this confidence level, in its own words — not just a number with no justification.' },
  { name: 'Executive Summary', detail: 'Aggregated deterministically from every finding above — auditable arithmetic, not a second AI opinion.' },
]

const TRUST_EXAMPLE = {
  title: "Disbursal routed through the partner NBFC's pooled settlement account",
  classification: 'Non-Compliant',
  evidence_found: "Description explicitly states disbursal is routed through the partner NBFC's pooled settlement account before reaching the borrower.",
  evidence_missing: 'None — the evidence found is direct and unambiguous.',
  inference_made: 'None — this is stated in the description, not inferred.',
  confidence_reasoning: 'The description explicitly states disbursal is routed through a pooled settlement account — direct, unambiguous evidence of the exact structure this clause prohibits, not an inference.',
}

const TECH_STACK = [
  { group: 'Frontend',       items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'] },
  { group: 'Backend',        items: ['Next.js Route Handlers', 'Supabase'] },
  { group: 'Database',       items: ['PostgreSQL'] },
  { group: 'Authentication', items: ['Signed session cookie (HMAC) — single-owner admin gate, no user table'] },
  { group: 'AI',             items: ['Provider-agnostic AI layer', 'Prompt engineering', 'Structured outputs (Zod)'] },
  { group: 'Knowledge Layer', items: ['Versioned Regulatory Knowledge Base', 'Retrieval-Augmented Generation', 'Citation verification'] },
  { group: 'Decision Layer', items: ['Rule engine', 'Adaptive discovery', 'Finding classification'] },
  { group: 'Performance',    items: ['Assessment cache', 'Stage cache', 'NDJSON streaming'] },
  { group: 'Deployment',     items: ['Vercel'] },
  { group: 'Version Control', items: ['GitHub'] },
]

const SCALABILITY = {
  current: ['Digital Lending', 'KYC / AML'],
  future: ['Payment Aggregator', 'PPI', 'Account Aggregator', 'NBFC', 'UPI', 'DPDP Act', 'SEBI', 'IRDAI', 'International Regulations'],
}

const TABLES = [
  { name: 'assessments',        detail: 'id, product_name, description, created_at.' },
  { name: 'questions',          detail: 'Discovery Q&A per assessment, persisted as answered.' },
  { name: 'findings',           detail: 'One row per clause tested — classification, confidence, evidence found/missing.' },
  { name: 'finding_impacts',    detail: 'Product / UI / engineering / business impact statements.' },
  { name: 'finding_citations',  detail: 'Source clause(s) per finding — verified flag, document version, publication date, and authority all resolved server-side.' },
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
            What happens after you click Start Assessment
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Twelve stages, each with one job — AI reasoning only where language understanding is
            genuinely needed, everything decidable by a plain rule resolved without it. This page
            walks the whole system the way you&apos;d present it in a design review.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['AI Product', 'FinTech', 'RegTech', 'System Design', 'Enterprise SaaS'].map(tag => (
              <Badge key={tag} variant="outline" className="rounded-full">{tag}</Badge>
            ))}
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <SectionLabel index={1} label="Problem" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Traditional compliance review is manual, slow, inconsistent across reviewers, and hard
            to audit after the fact. Generic LLMs promise to speed this up, but most produce
            plausible-sounding compliance advice with no way to check where a conclusion actually
            came from — and in a regulated domain, an unverifiable answer is worse than no answer
            at all. RegImpact was designed around three things a faster tool alone doesn&apos;t
            give you: trust, traceability, and explainability.
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabel index={2} label="End-to-End Architecture" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            The complete production pipeline, in order. Every stage below is live in this build —
            nothing here is aspirational.
          </p>
          <div className="flex flex-col gap-2">
            {PIPELINE.map((stage, i) => (
              <div key={stage.name} className="flex items-start gap-3 px-4 py-3 bg-surface border border-border rounded-lg">
                <span className="w-8 h-8 rounded-full bg-surface-raised text-accent flex items-center justify-center shrink-0">
                  <stage.icon size={16} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">Stage {i + 1}</span>
                    <span className="text-sm font-medium text-foreground">{stage.name}</span>
                  </div>
                  <span className="text-xs text-muted leading-relaxed"><strong className="text-foreground/80 font-medium">Business value —</strong> {stage.business}</span>
                  <span className="text-xs text-subtle leading-relaxed"><strong className="text-subtle font-medium">Technical value —</strong> {stage.technical}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabel index={3} label="Why This Architecture?" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Every major layer exists because of a specific decision, not by default.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WHY_DECISIONS.map(d => (
              <div key={d.name} className="flex flex-col gap-1.5 p-4 bg-surface border border-accent/20 rounded-xl">
                <span className="text-xs font-semibold text-accent uppercase tracking-wide">{d.name}</span>
                <span className="text-xs text-muted leading-relaxed">{d.body}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabel index={4} label="Regulatory Knowledge Base" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            A regulation isn&apos;t one static file — RBI amends, clarifies, and circulars its
            guidelines continuously. So the corpus is a Knowledge Base, not a PDF: Digital Lending
            already coexists with Guidelines/Circulars/FAQs/Amendments as document <em>types</em>{' '}
            it could hold (today it has one — the 2022 Guidelines), and KYC/AML the same for Master
            Directions/Circulars/FAQs. See the{' '}
            <Link href="/knowledge-base" className="text-accent hover:underline">Knowledge Base page</Link>{' '}
            for what&apos;s live today versus modeled for later.
          </p>
          <div className="flex flex-col gap-2">
            {KB_FLOW.map((item, i) => (
              <div key={item.name} className="flex items-start gap-3 px-4 py-3 bg-surface border border-border rounded-lg">
                <span className="w-6 h-6 rounded-full bg-surface-raised text-accent text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <span className="text-xs text-muted leading-relaxed">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-subtle leading-relaxed">
            This is what lets the architecture support regulatory evolution instead of depending
            on one document staying frozen in time.
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabel index={5} label="Trust & Explainability" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            RegImpact avoids black-box AI by keeping every step between a raw finding and the
            executive summary visible and checkable.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {TRUST_FLOW.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground bg-surface border border-border rounded-full px-3 py-1.5">{item.name}</span>
                {i < TRUST_FLOW.length - 1 && <ArrowRight size={14} className="text-subtle shrink-0" aria-hidden="true" />}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRUST_FLOW.map(item => (
              <div key={item.name} className="flex flex-col gap-1 px-4 py-3 bg-surface border border-border rounded-lg">
                <span className="text-xs font-semibold text-foreground">{item.name}</span>
                <span className="text-xs text-muted leading-relaxed">{item.detail}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-surface-raised border border-border rounded-xl flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">A real finding from the sample report</span>
            <span className="text-sm font-medium text-foreground">{TRUST_EXAMPLE.title}</span>
            <span className="text-xs font-semibold text-red-400 w-fit uppercase tracking-wide">{TRUST_EXAMPLE.classification}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">Evidence Found</span>
                <span className="text-xs text-muted leading-relaxed">{TRUST_EXAMPLE.evidence_found}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">Evidence Missing</span>
                <span className="text-xs text-muted leading-relaxed">{TRUST_EXAMPLE.evidence_missing}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">Inference Made</span>
                <span className="text-xs text-muted leading-relaxed">{TRUST_EXAMPLE.inference_made}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">Confidence Reasoning</span>
                <span className="text-xs text-muted leading-relaxed">{TRUST_EXAMPLE.confidence_reasoning}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabel index={6} label="Technology Stack" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TECH_STACK.map(group => (
              <div key={group.group} className="flex flex-col gap-2 p-4 bg-surface border border-border rounded-xl">
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent">{group.group}</span>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map(item => (
                    <Badge key={item} variant="outline" className="rounded-full text-[10px] font-normal">{item}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabel index={7} label="Scalability" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 bg-surface border border-accent/30 rounded-xl">
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Current</span>
              <div className="flex flex-wrap gap-1.5">
                {SCALABILITY.current.map(item => (
                  <Badge key={item} className="rounded-full text-[10px]">{item}</Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 p-4 bg-surface border border-border rounded-xl opacity-80">
              <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">Future</span>
              <div className="flex flex-wrap gap-1.5">
                {SCALABILITY.future.map(item => (
                  <Badge key={item} variant="outline" className="rounded-full text-[10px]">{item}</Badge>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-subtle leading-relaxed">
            Every item on the right extends the Knowledge Base — a new authority, area, or document
            — rather than requiring a change to retrieval, discovery, or assessment logic.
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <SectionLabel index={8} label="Implementation Detail" />
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Streaming</span>
              <p className="text-xs text-muted leading-relaxed">
                <code className="text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded text-accent">/api/generate</code>{' '}
                responds with NDJSON — one JSON event per line (step / finding / done / error). The
                client renders findings as they arrive; step messages narrate real server-side
                stages, not a simulated progress bar.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Data Model</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TABLES.map(table => (
                  <div key={table.name} className="flex flex-col gap-1 px-3 py-2 bg-surface border border-border rounded-lg">
                    <code className="text-[10px] font-mono text-accent">{table.name}</code>
                    <span className="text-[11px] text-muted leading-relaxed">{table.detail}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Cost Protection</span>
              <p className="text-xs text-muted leading-relaxed">
                Every AI-inference-calling route checks and atomically increments a shared daily
                counter before calling the inference engine — never after. A cache hit or a
                rule-engine decision never reaches this counter, since no AI call happened.
                Configurable via <code className="text-[10px] font-mono bg-surface px-1 py-0.5 rounded text-accent">MAX_DAILY_ASSESSMENTS</code>.
              </p>
            </div>
            <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-200 leading-relaxed">
                Honest scope note: Digital Lending and KYC/AML are the two areas with active
                documents today. KYC/AML clauses are <strong>unverified</strong> — reconstructed
                from general knowledge, not transcribed from the current source text — and every
                citation built from them carries that flag through to the report.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <Link href="/demo/sample" className="text-sm font-medium text-accent hover:underline underline-offset-2">
            See a completed assessment →
          </Link>
          <Link href="/knowledge-base" className="text-sm font-medium text-accent hover:underline underline-offset-2">
            Explore the Knowledge Base →
          </Link>
          <Link href="/case-study" className="text-sm font-medium text-subtle hover:text-foreground underline underline-offset-2">
            Read the case study →
          </Link>
        </div>

      </div>
    </div>
  )
}
