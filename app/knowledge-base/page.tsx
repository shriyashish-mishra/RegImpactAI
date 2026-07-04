import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock } from 'lucide-react'
import SiteHeader from '@/components/shell/SiteHeader'
import SectionLabel from '@/components/primitives/SectionLabel'
import { Badge } from '@/components/ui/badge'
import { REGULATORY_AREAS, REGULATORY_DOCUMENTS } from '@/lib/knowledgeBase/registry'

const TITLE = 'Regulatory Knowledge Base — RegImpact AI'
const DESCRIPTION = 'How RegImpact AI organizes regulations — authorities, areas, documents, and versions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  master_direction: 'Master Direction',
  guideline: 'Guideline',
  circular: 'Circular',
  notification: 'Notification',
  faq: 'FAQ',
  press_release: 'Press Release',
  clarification: 'Clarification',
  advisory: 'Advisory',
  discussion_paper: 'Discussion Paper',
}

export default function KnowledgeBasePage() {
  const authorities = Array.from(new Set(REGULATORY_AREAS.map(a => a.authority)))

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current="knowledge-base" />

      <div className="mx-auto max-w-4xl px-6 py-16 flex flex-col gap-12">

        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Knowledge Base
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground tracking-tight">
            The Regulatory Knowledge Base
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            This is how RegImpact AI organizes what it assesses against — not one static document
            per regulation, but authorities, areas, and versioned documents that can grow over
            time. This page shows the architecture, not an admin console; see the{' '}
            <Link href="/architecture" className="text-accent hover:underline">architecture walkthrough</Link>{' '}
            for how it&apos;s implemented.
          </p>
        </div>

        {authorities.map(authority => (
          <section key={authority} className="flex flex-col gap-5">
            <SectionLabel index={1} label={authority} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {REGULATORY_AREAS.filter(a => a.authority === authority).map(area => {
                const documents = REGULATORY_DOCUMENTS.filter(d => d.area_code === area.code)
                const activeDoc = documents.find(d => d.status === 'active')
                const documentTypes = Array.from(new Set(documents.map(d => DOCUMENT_TYPE_LABELS[d.document_type] ?? d.document_type)))

                if (area.status === 'coming_soon') {
                  return (
                    <div key={area.code} className="flex flex-col gap-3 p-5 bg-surface border border-border rounded-xl opacity-60">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">{area.name}</h3>
                        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-subtle">
                          <Clock size={12} aria-hidden="true" /> Coming Soon
                        </span>
                      </div>
                      <p className="text-xs text-subtle leading-relaxed">
                        Modeled as a regulatory area in the Knowledge Base registry — no documents
                        or corpus content yet, so no assessments run against it.
                      </p>
                    </div>
                  )
                }

                return (
                  <div key={area.code} className="flex flex-col gap-3 p-5 bg-surface border border-accent/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{area.name}</h3>
                      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-accent">
                        <CheckCircle2 size={12} aria-hidden="true" /> Active
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">Current Version</span>
                        <span className="text-sm font-medium text-foreground">{activeDoc?.version ?? '—'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">Last Reviewed</span>
                        <span className="text-sm font-medium text-foreground">{activeDoc?.last_reviewed ?? 'Not yet tracked'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">Document Types</span>
                      <div className="flex flex-wrap gap-1.5">
                        {documentTypes.map(t => (
                          <Badge key={t} variant="outline" className="rounded-full text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    {activeDoc && !activeDoc.verified && (
                      <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-md px-2 py-1">
                        Unverified — reconstructed from general knowledge, not transcribed from the current source text.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <p className="text-xs text-subtle leading-relaxed pt-4 border-t border-border">
          Every field above is real data from{' '}
          <code className="font-mono bg-surface px-1 py-0.5 rounded text-accent">lib/knowledgeBase/registry.ts</code> — nothing
          on this page is illustrative or fabricated. &ldquo;Coming Soon&rdquo; areas are modeled
          in the registry today specifically so adding real documents to them later is additive,
          not a redesign.
        </p>

        <div className="flex items-center gap-6 pt-2">
          <Link href="/architecture" className="text-sm font-medium text-accent hover:underline underline-offset-2">
            Understand the technical architecture →
          </Link>
          <Link href="/demo/sample" className="text-sm font-medium text-subtle hover:text-foreground underline underline-offset-2">
            See a completed assessment →
          </Link>
        </div>

      </div>
    </div>
  )
}
