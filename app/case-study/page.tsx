import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/shell/SiteHeader'

const TITLE = 'Case Study — RegImpact AI'
const DESCRIPTION = 'Why RegImpact AI was built, and how it works.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const WORKFLOW = [
  { step: 'Describe',   detail: 'The user describes their fintech product in plain language — no forms, no checkboxes.' },
  { step: 'Understand', detail: "Gemini infers a product model (activities, features, journeys) and which RBI regulatory areas are triggered, then mirrors that understanding back for the user to confirm or correct." },
  { step: 'Discover',   detail: 'Once confirmed, Gemini asks only the 3–5 clarifying questions that materially change the compliance answer — not a generic intake form.' },
  { step: 'Assess',     detail: 'The confirmed model, discovery answers, and the relevant regulatory clauses are tested against each other to produce findings, streamed live to the UI as they\'re produced.' },
  { step: 'Report',     detail: 'Every finding is persisted with its citation, impact breakdown, and recommendations, and rendered as a shareable report.' },
]

const STACK = [
  'Next.js (App Router) + React + TypeScript',
  'Tailwind CSS',
  'Supabase (Postgres)',
  'Google Gemini, via the Vercel AI SDK',
  'Zod for schema validation at every AI boundary',
]

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader current="case-study" />

      <div className="mx-auto max-w-3xl px-6 py-16 flex flex-col gap-12">

        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            Case Study
          </span>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            RegImpact AI
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            AI-powered regulatory impact assessment for Indian fintech products, built to answer
            a specific question: can an AI compliance tool prove its findings are correct, not
            just produce them?
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            The problem
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Most AI compliance demos are good at generating plausible-sounding findings. Few of
            them can show their work — which specific clause a finding is based on, and whether
            the model quoted it accurately or paraphrased it into something that sounds right but
            isn&apos;t. For a regulated domain like RBI fintech compliance, an unverifiable
            citation is worse than no citation at all.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            The product decision
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The obvious way to make an AI compliance demo look impressive is breadth — cover every
            RBI regulation shallowly. I decided against that. A trust-focused product loses all
            its credibility the first time a reviewer catches one fabricated citation, so I scoped
            this to prove the citation-verification mechanism end to end on a single regulatory
            area first (Digital Lending Guidelines), before adding a second. Depth on one area
            that a compliance reviewer can actually trust beats coverage on five they can&apos;t.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            The approach
          </h2>
          <div className="flex flex-col gap-2">
            {WORKFLOW.map((item, i) => (
              <div key={item.step} className="flex items-start gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-slate-800">{item.step}</span>
                  <span className="text-xs text-slate-500 leading-relaxed">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            What makes this different
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every finding is required to cite a real clause from the regulatory corpus — the
            clause text is copied verbatim, not paraphrased, and joined to the source clause by
            id rather than free text, so the citation can always be traced back to what it
            actually references. The model classifies every clause it&apos;s given as compliant,
            non-compliant, a potential gap, or requiring more information — not just the ones
            that look like problems — so a clean result reads as &ldquo;checked and confirmed,&rdquo;
            not silence, and an aggregate compliance score is possible at all.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            A trade-off I made explicitly
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            When I added a second regulatory area (KYC/AML), I didn&apos;t have a verified source
            document for it — only general knowledge of what the regulation covers. I had three
            options: leave it out, ship it looking identical to the verified DLG clauses, or ship
            it with an explicit &ldquo;unverified — needs legal review&rdquo; flag that follows
            the citation everywhere it&apos;s shown. I chose the third. A compliance tool that
            quietly hides its own uncertainty is more dangerous than one that discloses it — and
            hiding it would have contradicted the entire premise of this project.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            How I&apos;d measure this if it were live
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            This is a demo, not a product with real users yet — so these are the metrics I&apos;d
            instrument first, not results I&apos;m claiming: the percentage of findings a human
            compliance reviewer accepts without edits (the real test of citation trust), time from
            product description to first finding, and how often reviewers escalate an unverified
            citation versus a verified one — which would tell me whether the &ldquo;needs legal
            review&rdquo; flag is actually changing reviewer behavior or just being ignored.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Tech stack
          </h2>
          <ul className="flex flex-col gap-1.5">
            {STACK.map(item => (
              <li key={item} className="text-sm text-slate-600 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            What&apos;s next
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The current build covers two regulatory areas end to end — RBI&apos;s Digital Lending
            Guidelines (fully verified) and KYC/AML (flagged unverified until checked against the
            current source text) — to prove the citation-verification approach generalizes before
            scaling it further. Next: verifying the KYC/AML corpus against the real regulation,
            more regulatory domains, and full multi-user auth. See the{' '}
            <Link href="/architecture" className="text-indigo-600 hover:underline">architecture walkthrough</Link>{' '}
            for the current scope in detail.
          </p>
        </section>

        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <Link href="/demo/sample" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
            View a sample report →
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-700 underline underline-offset-2">
            Try it yourself →
          </Link>
        </div>

      </div>
    </div>
  )
}
