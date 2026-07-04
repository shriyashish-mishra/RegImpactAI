'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { StructuredProductInfo, ProductElement, Question, Finding } from '@/lib/types'

type Props = {
  structuredInfo: StructuredProductInfo
  description: string
  inferredElements: ProductElement[]
  questions: Question[]
  findings: Finding[]
  areaCount: number
  clauseCount: number
}

const CLASSIFICATION_LABEL: Record<Finding['classification'], string> = {
  compliant: 'Compliant',
  non_compliant: 'Non-Compliant',
  potential_gap: 'Potential Gap',
  info_required: 'Info Required',
}

function CardShell({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="snap-center shrink-0 w-[85vw] sm:w-[420px] flex flex-col gap-3 p-5 bg-surface border border-border rounded-xl">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-surface-raised text-accent text-xs font-mono font-semibold flex items-center justify-center shrink-0">
          {step}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-subtle">{title}</span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-80">
        {children}
      </div>
    </div>
  )
}

export default function AssessmentJourney({
  structuredInfo, description, inferredElements, questions, findings, areaCount, clauseCount,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollByCard(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' })
  }

  const structuredFields: { label: string; values: string[] }[] = [
    { label: 'Industry', values: [structuredInfo.industry] },
    { label: 'Product Categories', values: structuredInfo.categories },
    { label: 'Operating Geographies', values: structuredInfo.geographies },
    { label: 'Target Customers', values: structuredInfo.target_customers },
    { label: 'Regulated Entities', values: structuredInfo.regulated_entities },
    { label: 'Capabilities', values: structuredInfo.capabilities },
  ]

  const breakdown = {
    compliant: findings.filter(f => f.classification === 'compliant').length,
    non_compliant: findings.filter(f => f.classification === 'non_compliant').length,
    potential_gap: findings.filter(f => f.classification === 'potential_gap').length,
    info_required: findings.filter(f => f.classification === 'info_required').length,
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">Replay This Assessment</span>
          <span className="text-xs text-subtle">How this report actually got produced, step by step</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scrollByCard(-1)}
            aria-label="Previous step"
            className="w-7 h-7 rounded-full border border-border bg-surface flex items-center justify-center text-muted hover:text-foreground hover:border-accent transition-colors"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollByCard(1)}
            aria-label="Next step"
            className="w-7 h-7 rounded-full border border-border bg-surface flex items-center justify-center text-muted hover:text-foreground hover:border-accent transition-colors"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 scrollbar-thin"
      >
        <CardShell step={1} title="Structured Inputs">
          {structuredFields.map(f => (
            <div key={f.label} className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">{f.label}</span>
              <div className="flex flex-wrap gap-1">
                {f.values.map(v => (
                  <Badge key={v} variant="outline" className="rounded-full text-[10px]">{v}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardShell>

        <CardShell step={2} title="Product Description">
          <p className="text-xs text-muted leading-relaxed italic">&ldquo;{description}&rdquo;</p>
        </CardShell>

        <CardShell step={3} title="Mirror Understanding">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">What You Told Us</span>
            <span className="text-xs text-muted leading-relaxed">
              {structuredInfo.product_name} — {structuredInfo.categories.join(', ')}, serving {structuredInfo.target_customers.join(', ').toLowerCase()} via {structuredInfo.regulated_entities.join(', ').toLowerCase()}.
            </span>
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">What RegImpact Inferred</span>
            <div className="flex flex-col gap-1">
              {inferredElements.map(el => (
                <span key={el.label} className={`text-xs leading-relaxed ${el.is_negative ? 'text-amber-300' : 'text-muted'}`}>
                  {el.is_negative ? '— ' : '✓ '}{el.label}
                </span>
              ))}
            </div>
          </div>
        </CardShell>

        <CardShell step={4} title="Adaptive Discovery">
          {questions.map(q => (
            <div key={q.id} className="flex flex-col gap-0.5 pb-2 border-b border-border last:border-0 last:pb-0">
              <span className="text-xs font-medium text-foreground">{q.prompt}</span>
              <span className="text-xs text-accent">{q.answer}</span>
            </div>
          ))}
        </CardShell>

        <CardShell step={5} title="Assessment Engine">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">Regulations Considered</span>
              <span className="text-sm font-semibold text-foreground">{areaCount}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">Clauses in Scope</span>
              <span className="text-sm font-semibold text-foreground">{clauseCount}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-subtle">Finding Breakdown (this sample)</span>
            {(Object.keys(breakdown) as (keyof typeof breakdown)[]).map(key => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted">{CLASSIFICATION_LABEL[key]}</span>
                <span className="font-medium text-foreground">{breakdown[key]}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-subtle leading-relaxed pt-1">
            This static demo curates one finding per classification to show the full system — a
            live assessment classifies every clause in scope, not just a sample of them.
          </p>
        </CardShell>

        <CardShell step={6} title="Executive Summary">
          <p className="text-xs text-muted leading-relaxed">
            Compliance score, risk level, and launch recommendation, computed deterministically
            from every finding above — scroll down to see the full report.
          </p>
        </CardShell>
      </div>
    </div>
  )
}
