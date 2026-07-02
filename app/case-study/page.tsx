import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/shell/SiteHeader'

export const metadata: Metadata = {
  title: 'Case Study — RegImpact AI',
  description: 'Why RegImpact AI was built, and how it works.',
}

const WORKFLOW = [
  { step: 'Describe',   detail: 'The user describes their fintech product in plain language — no forms, no checkboxes.' },
  { step: 'Understand', detail: "Claude infers a product model (activities, features, journeys) and which RBI regulatory areas are triggered, then mirrors that understanding back for the user to confirm or correct." },
  { step: 'Discover',   detail: 'Once confirmed, Claude asks only the 3–5 clarifying questions that materially change the compliance answer — not a generic intake form.' },
  { step: 'Assess',     detail: 'The confirmed model, discovery answers, and the relevant regulatory clauses are tested against each other to produce findings, streamed live to the UI as they\'re produced.' },
  { step: 'Report',     detail: 'Every finding is persisted with its citation, impact breakdown, and recommendations, and rendered as a shareable report.' },
]

const STACK = [
  'Next.js (App Router) + React + TypeScript',
  'Tailwind CSS',
  'Supabase (Postgres)',
  'Anthropic Claude, via the Vercel AI SDK',
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
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
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
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
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
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            What makes this different
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every finding is required to cite a real clause from the regulatory corpus — the
            clause text is copied verbatim, not paraphrased, and joined to the source clause by
            id rather than free text, so the citation can always be traced back to what it
            actually references. Findings are only produced where there&apos;s a real, specific
            gap; the model is explicitly instructed not to invent findings for clauses a product
            clearly satisfies.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
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
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            What&apos;s next
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The current build covers one regulatory area end to end (RBI&apos;s Digital Lending
            Guidelines) to prove the citation-verification approach works before scaling it out.
            Next: more regulatory domains, authentication and report history, and PDF export. See
            the <Link href="/architecture" className="text-indigo-600 hover:underline">architecture walkthrough</Link>{' '}
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
