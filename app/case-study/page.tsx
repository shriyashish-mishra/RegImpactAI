import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/shell/SiteHeader'
import SectionLabel from '@/components/primitives/SectionLabel'
import { Badge } from '@/components/ui/badge'
import { PORTFOLIO_URL } from '@/lib/site'

const TITLE = 'Case Study — RegImpact AI'
const DESCRIPTION = 'Why RegImpact AI was built, and how it works.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const CONSTRAINTS = [
  { label: 'Budget',      detail: '$0 — free-tier AI inference and Supabase, by explicit choice, not a fallback.' },
  { label: 'Team',        detail: 'Solo build, portfolio timeline — not an enterprise team or roadmap.' },
  { label: 'Source data', detail: 'A verified source document existed for one regulatory area (DLG), not the second (KYC/AML).' },
]

const STRATEGIES = [
  {
    title: 'Cover every RBI regulation, shallowly',
    selected: false,
    body: 'Looks impressive in a demo — until a reviewer checks one citation and finds it doesn\'t hold up. Breadth without verification is the fastest way to lose all credibility at once.',
  },
  {
    title: 'Prove citation-verification depth-first, one area, then expand',
    selected: true,
    body: 'Get the trust mechanism right on Digital Lending Guidelines end to end before adding a second regulatory area. Depth a reviewer can actually check beats coverage they can\'t.',
  },
  {
    title: 'Skip citations, ship findings faster',
    selected: false,
    body: 'Faster to build, but defeats the entire premise — an AI compliance tool without a paper trail is exactly the "trust me" problem this project exists to solve.',
  },
]

const WHY_CARDS = [
  { title: 'Why AI', body: 'Reading a product description against a regulation is language work, not arithmetic. The value isn\'t raw speed — it\'s applying the same standard every time, consistently, which manual review can\'t guarantee across reviewers.' },
  { title: 'Why retrieval, not memory', body: 'Findings are tested against real clauses pulled from a corpus at request time, never recalled from training data. At 19 clauses today, that\'s a direct filter, not embeddings-based search — a deliberate, disclosed scope limit, not a hidden one. See the architecture walkthrough for the honest version.' },
  { title: 'Why adaptive questioning', body: 'A generic intake form asks the same questions regardless of what you\'re building. The AI inference engine only asks the 3-5 questions that would actually change the compliance answer for this specific product.' },
]

const PIPELINE = [
  { step: 'Describe',   route: 'POST /api/synthesize', detail: 'Plain-language product description in, product model + triggered regulatory areas out.' },
  { step: 'Understand', route: '(client-only)',         detail: 'Model mirrored back for the user to confirm or correct — no network call.' },
  { step: 'Discover',   route: 'POST /api/questions',   detail: '3-5 targeted clarifying questions, scoped to what the corpus can actually test.' },
  { step: 'Assess',     route: 'POST /api/generate',    detail: 'Every clause tested and classified, streamed to the UI as each finding completes.' },
  { step: 'Report',     route: 'GET /report/[id]',      detail: 'Findings, citations, and executive summary assembled into a shareable report.' },
]

const TRADEOFFS = [
  {
    title: 'Shipping KYC/AML with an unverified flag, not leaving it out',
    body: 'No verified source document existed for KYC/AML — only general regulatory knowledge. Options were: leave it out, ship it looking as trustworthy as the verified DLG clauses, or ship it with an explicit "unverified — needs legal review" flag that follows the citation everywhere it\'s shown. Chose the third — hiding the uncertainty would have contradicted the entire premise of the project.',
  },
  {
    title: 'A daily hard quota, not trusting the model provider\'s own limit',
    body: 'Discovered live, during this build, that the AI inference engine\'s free-tier quota can be exhausted by normal testing volume. Rather than let the app depend on the provider\'s own rate limiting (and fail with a raw error when it hits), RegImpact enforces its own configurable daily cap in Postgres and refuses to call the inference engine at all once it\'s reached — a deliberate constraint, not an afterthought.',
  },
]

const STACK = [
  'Next.js (App Router) + React + TypeScript',
  'Tailwind CSS',
  'Supabase (Postgres)',
  'AI inference engine (interchangeable model provider), via the Vercel AI SDK',
  'Zod for schema validation at every AI boundary',
]

const SUCCESS_METRICS = [
  { name: 'Reviewer Acceptance Rate', measures: 'Share of findings a compliance reviewer accepts without edits.', why: 'The real test of citation trust — this is the metric the whole product is built to move.' },
  { name: 'Time-to-First-Insight', measures: 'Elapsed time from product description submitted to the first finding surfacing.', why: 'Compliance review today is measured in days; this is where AI assistance should show up first.' },
  { name: 'Compliance Review Time Saved', measures: 'Reviewer hours on an AI-assisted assessment vs. a fully manual one.', why: 'The business case for the product — speed without a trust tradeoff.' },
  { name: 'Citation Trust Rate', measures: 'How often reviewers escalate an unverified citation vs. a verified one.', why: 'Tests whether the "needs legal review" flag actually changes reviewer behavior, or gets ignored.' },
  { name: 'Hallucination Flag Rate', measures: 'How often the evidence-consistency guard fires, and reviewer agreement with it.', why: 'A flag reviewers routinely override is miscalibrated and needs retuning, not removal.' },
  { name: 'Assessment Completion Rate', measures: 'Share of started assessments that reach a final report.', why: 'Drop-off between Discovery and Report is the clearest signal of onboarding friction.' },
  { name: 'Adaptive Question Effectiveness', measures: 'Share of Discovery answers that actually changed a finding\'s classification.', why: 'Justifies asking questions at all instead of a static intake form — proves it isn\'t decorative.' },
  { name: 'Retrieval Precision', measures: 'Share of retrieved clauses actually relevant to the declared product categories.', why: 'Validates category-based filtering over testing the full corpus against every product regardless of fit.' },
]

const ROADMAP = [
  { title: 'Enterprise Collaboration & Team Workspaces', body: 'Multiple reviewers on one assessment, with role-based access instead of a single-owner admin gate.' },
  { title: 'Versioned Regulation Updates', body: 'Track when a regulatory clause changes and which past assessments relied on the superseded version.' },
  { title: 'Workflow Integrations', body: 'Push findings into the tools compliance teams already work in — ticketing, GRC platforms, Slack.' },
  { title: 'Continuous Compliance Monitoring', body: 'Re-assess automatically when either the product or the underlying regulation changes, not just on demand.' },
  { title: 'Regulatory Change Alerts', body: 'Notify affected teams the moment a regulator amends a clause their product was assessed against.' },
  { title: 'Audit History', body: 'A full change log per assessment — every re-run, every edit, every reviewer decision, timestamped.' },
  { title: 'Explainable AI Improvements', body: 'Deeper reasoning traces beyond evidence/citation — surfacing the model\'s full chain of inference on request.' },
  { title: 'Additional Jurisdictions', body: 'Singapore, UAE, UK, and EU are already selectable at onboarding — the roadmap is building real regulatory corpora behind them.' },
  { title: 'Additional Regulatory Domains', body: 'PPI, UPI-specific rules, and insurance regulation, using the same citation-verification approach proven on DLG and KYC/AML.' },
  { title: 'Offline Assessment', body: 'A downloadable assessment kit for environments where a live AI call isn\'t an option.' },
  { title: 'Human-in-the-Loop Review', body: 'A structured reviewer workflow for confirming, editing, or overriding a finding — with that decision feeding back into future assessments.' },
  { title: 'Policy Comparison', body: 'Diff two versions of the same product, or the same product against two regulatory regimes, side by side.' },
]

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current="case-study" />

      <div className="mx-auto max-w-4xl px-6 py-16 flex flex-col gap-16">

        <div className="flex flex-col gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Case Study
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground tracking-tight">
            RegImpact AI
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            AI-powered regulatory impact assessment for Indian fintech products, built to answer
            a specific question: can an AI compliance tool prove its findings are correct, not
            just produce them?
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['Product Strategy', 'AI Product', 'RegTech', 'FinTech', 'RAG', 'Explainable AI'].map(tag => (
              <Badge key={tag} variant="outline" className="rounded-full">{tag}</Badge>
            ))}
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <SectionLabel index={1} label="The Problem" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Most AI compliance demos are good at generating plausible-sounding findings. Few of
            them can show their work — which specific clause a finding is based on, and whether
            the model quoted it accurately or paraphrased it into something that sounds right but
            isn&apos;t. For a regulated domain like RBI fintech compliance, an unverifiable
            citation is worse than no citation at all.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={2} label="Constraints" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CONSTRAINTS.map(c => (
              <div key={c.label} className="flex flex-col gap-1.5 p-4 bg-surface border border-border rounded-xl">
                <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">{c.label}</span>
                <span className="text-xs text-muted leading-relaxed">{c.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={3} label="Strategy Options" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STRATEGIES.map(s => (
              <div
                key={s.title}
                className={`relative flex flex-col gap-3 p-5 bg-surface border rounded-xl ${s.selected ? 'border-accent' : 'border-border'}`}
              >
                {s.selected && (
                  <span className="absolute -top-2.5 right-4 text-[10px] font-semibold uppercase tracking-widest bg-accent text-zinc-950 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
                <h3 className="text-sm font-semibold text-foreground leading-snug">{s.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{s.body}</p>
                <span className={`text-[10px] font-semibold uppercase tracking-widest ${s.selected ? 'text-accent' : 'text-red-400'}`}>
                  {s.selected ? 'Selected' : 'Not selected'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={4} label="Why AI, RAG, Adaptive Questioning" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WHY_CARDS.map(c => (
              <div key={c.title} className="flex flex-col gap-2 p-5 bg-surface border border-border rounded-xl">
                <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={5} label="System Design" />
          <div className="flex flex-col gap-2">
            {PIPELINE.map((item, i) => (
              <div key={item.step} className="flex items-start gap-3 px-4 py-3 bg-surface border border-border rounded-lg">
                <span className="w-6 h-6 rounded-full bg-surface-raised text-accent text-xs font-mono font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{item.step}</span>
                    <code className="text-[10px] font-mono text-subtle bg-surface-raised px-1.5 py-0.5 rounded">{item.route}</code>
                  </div>
                  <span className="text-xs text-muted leading-relaxed">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={6} label="Tradeoffs" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRADEOFFS.map(t => (
              <div key={t.title} className="flex flex-col gap-2 p-5 bg-surface border border-border rounded-xl">
                <h3 className="text-sm font-semibold text-foreground leading-snug">{t.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={7} label="Technical Decisions" />
          <ul className="flex flex-col gap-1.5">
            {STACK.map(item => (
              <li key={item} className="text-sm text-muted flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={8} label="Product Success Metrics" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            RegImpact AI hasn&apos;t run against real reviewer traffic yet, so nothing below is a
            claimed result — it&apos;s the KPI framework I&apos;d instrument on day one in
            production, the same way I&apos;d define success metrics before shipping any product.
            The one thing already true today, structurally, is that every finding carries a
            citation — the rest needs real usage to measure.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUCCESS_METRICS.map(m => (
              <div key={m.name} className="flex flex-col gap-1.5 p-4 bg-surface border border-border rounded-xl">
                <span className="text-sm font-semibold text-foreground">{m.name}</span>
                <span className="text-xs text-muted leading-relaxed">{m.measures}</span>
                <span className="text-xs text-subtle leading-relaxed">{m.why}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={9} label="Product Roadmap" />
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            The current build proves the citation-verification approach end to end on two
            regulatory areas — Digital Lending Guidelines and KYC/AML — deliberately, before
            scaling breadth. Here&apos;s where the product goes from there.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROADMAP.map(r => (
              <div key={r.title} className="flex flex-col gap-1 p-4 bg-surface border border-border rounded-xl">
                <span className="text-sm font-medium text-foreground">{r.title}</span>
                <span className="text-xs text-muted leading-relaxed">{r.body}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-subtle leading-relaxed">
            See the{' '}
            <Link href="/architecture" className="text-accent hover:underline">architecture walkthrough</Link>{' '}
            for exactly what&apos;s built today versus what&apos;s ahead.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionLabel index={10} label="About the Creator" />
          <div className="flex flex-col gap-3 max-w-2xl">
            <p className="text-sm text-muted leading-relaxed">
              I&apos;m Shriyashish Mishra, a Product Manager. I&apos;m drawn to problems that start
              ambiguous — where the hard part isn&apos;t writing code, it&apos;s deciding what
              &ldquo;correct&rdquo; even means before you can build toward it.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              AI products interest me because they make that ambiguity structural: a model can
              sound confident and still be wrong, and most products don&apos;t give a user any way
              to tell the difference. I think that gap — between confidence and correctness — is
              the actual product problem of this generation of AI tools, not a footnote to solve
              later. Trust and explainability aren&apos;t features you add on top; they&apos;re
              the design constraint everything else has to work within.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              I built RegImpact AI to work that constraint end to end in a domain where it matters
              most — regulatory compliance, where an unverifiable answer is worse than no answer
              at all. See more of my work at{' '}
              <a href={PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                my portfolio
              </a>.
            </p>
          </div>
        </section>

        <div className="flex items-center gap-6 pt-4 border-t border-border">
          <Link href="/architecture" className="text-sm font-medium text-accent hover:underline underline-offset-2">
            Understand the technical architecture →
          </Link>
          <Link href="/demo/sample" className="text-sm font-medium text-accent hover:underline underline-offset-2">
            See a completed assessment →
          </Link>
          <Link href="/" className="text-sm font-medium text-subtle hover:text-foreground underline underline-offset-2">
            Try it yourself →
          </Link>
        </div>

      </div>
    </div>
  )
}
