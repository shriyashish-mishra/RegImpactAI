import Link from 'next/link'
import { Clock, Scale, HelpCircle, Search, MessageSquare, Database, Brain, ClipboardCheck, ShieldCheck } from 'lucide-react'
import SectionLabel from '@/components/primitives/SectionLabel'
import { Badge } from '@/components/ui/badge'

const TAGS = ['Product Strategy', 'AI / ML', 'Regulatory Tech', 'Compliance', 'B2B SaaS']

const PROBLEMS = [
  {
    icon: Clock,
    color: 'text-blue-400 bg-blue-500/10',
    border: 'border-l-blue-500/60',
    title: 'Manual reviews take weeks',
    body: 'Compliance assessments today mean a person reading a product spec against a regulation line by line — slow, and it doesn\'t scale with how fast fintech products ship.',
  },
  {
    icon: Scale,
    color: 'text-amber-400 bg-amber-500/10',
    border: 'border-l-amber-500/60',
    title: 'Interpretation varies reviewer to reviewer',
    body: 'Two reviewers reading the same product against the same clause can reach different conclusions — there\'s no consistent, repeatable standard being applied.',
  },
  {
    icon: HelpCircle,
    color: 'text-purple-400 bg-purple-500/10',
    border: 'border-l-purple-500/60',
    title: 'Findings without a paper trail',
    body: 'Most AI compliance tools produce a plausible-sounding verdict with no way to check it against the actual regulatory text — an unverifiable finding is worse than no finding.',
  },
]

const PIPELINE = [
  { icon: Search,          stage: 'Describe',  detail: 'Plain-language product description, no forms' },
  { icon: MessageSquare,   stage: 'Understand', detail: 'Product model inferred, mirrored back for confirmation' },
  { icon: Database,        stage: 'Discover',   detail: '3-5 targeted questions, not a generic intake form' },
  { icon: Brain,           stage: 'Assess',     detail: 'Every clause tested and classified against the model' },
  { icon: ClipboardCheck,  stage: 'Report',     detail: 'Executive summary, evidence, and verified citations' },
]

export default function LandingStory() {
  return (
    <div className="flex flex-col gap-20 pb-16">

      {/* Hero */}
      <div className="flex flex-col gap-5 pt-4">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          AI Product Management · Live Demo
        </span>
        <h1 className="font-serif text-5xl sm:text-6xl text-foreground tracking-tight">
          RegImpact AI
        </h1>
        <p className="text-lg text-muted max-w-xl leading-relaxed">
          AI-powered regulatory compliance assessment for Indian fintech — every finding traced
          back to a real, verifiable regulatory clause.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {TAGS.map((tag, i) => (
            <Badge key={tag} variant={i === TAGS.length - 1 ? 'default' : 'outline'} className="rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Problem */}
      <section className="flex flex-col gap-5">
        <SectionLabel index={1} label="The Problem" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROBLEMS.map(p => (
            <div key={p.title} className={`flex flex-col gap-3 p-5 bg-surface border border-border border-l-2 ${p.border} rounded-xl`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${p.color}`}>
                <p.icon size={16} aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-5">
        <SectionLabel index={2} label="How RegImpact Works" />
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          Five stages, each one feeding the next — not a single black-box prompt.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {PIPELINE.map((p, i) => (
            <div key={p.stage} className="flex flex-col gap-2 p-4 bg-surface border border-border rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full flex items-center justify-center bg-surface-raised text-accent">
                  <p.icon size={14} aria-hidden="true" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">Stage {i + 1}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{p.stage}</span>
              <span className="text-xs text-muted leading-relaxed">{p.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Why AI / RAG / adaptive questioning */}
      <section className="flex flex-col gap-5">
        <SectionLabel index={3} label="Why It's Built This Way" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 p-5 bg-surface border border-border rounded-xl">
            <h3 className="text-sm font-semibold text-foreground">Why AI at all</h3>
            <p className="text-xs text-muted leading-relaxed">
              Reading a product against a regulation is language work, not arithmetic — the part AI
              is actually good at. The value isn&apos;t speed alone, it&apos;s applying the same
              standard every time, which manual review can&apos;t guarantee.
            </p>
          </div>
          <div className="flex flex-col gap-2 p-5 bg-surface border border-border rounded-xl">
            <h3 className="text-sm font-semibold text-foreground">Why retrieval, not memory</h3>
            <p className="text-xs text-muted leading-relaxed">
              Findings are tested against real clauses pulled from a corpus at request time, not
              recalled from what the model memorized during training — so every finding can be
              traced back to the exact text it&apos;s based on. See{' '}
              <Link href="/architecture" className="text-accent hover:underline">the architecture</Link>{' '}
              for the honest version of this, including its current scale limits.
            </p>
          </div>
          <div className="flex flex-col gap-2 p-5 bg-surface border border-border rounded-xl">
            <h3 className="text-sm font-semibold text-foreground">Why adaptive questioning</h3>
            <p className="text-xs text-muted leading-relaxed">
              A generic intake form asks the same twenty questions regardless of what you&apos;re
              building. RegImpact only asks the 3-5 questions that would actually change the
              compliance answer for your specific product.
            </p>
          </div>
        </div>
      </section>

      {/* What makes it different */}
      <section className="flex flex-col gap-4 p-6 bg-surface border border-accent/30 rounded-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent" aria-hidden="true" />
          <SectionLabel index={4} label="What Makes This Different" />
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          Every finding — compliant or not — cites the exact clause it&apos;s based on, verbatim,
          joined back to the source by id rather than free text. A finding claiming high confidence
          with no supporting evidence gets flagged automatically, not hidden. Read the{' '}
          <Link href="/case-study" className="text-accent hover:underline">full case study</Link>{' '}
          for the product decisions behind that.
        </p>
      </section>

      {/* Next steps */}
      <section className="flex flex-wrap items-center gap-6 pt-2 border-t border-border">
        <Link href="/case-study" className="text-sm font-medium text-accent hover:underline underline-offset-4">
          See how it was designed →
        </Link>
        <Link href="/demo/sample" className="text-sm font-medium text-accent hover:underline underline-offset-4">
          See a completed assessment →
        </Link>
        <span className="text-sm text-subtle">or try it yourself below ↓</span>
      </section>

    </div>
  )
}
