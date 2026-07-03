'use client'

import { Badge }         from '@/components/ui/badge'
import { Button }        from '@/components/ui/button'
import ConfidenceBadge   from '@/components/primitives/ConfidenceBadge'
import type { DraftModel, ConfirmedModel, ProductElement, TriggeredArea } from '@/lib/types'

type Props = {
  draftModel:   DraftModel
  assessmentId: string
  onConfirm:    (model: ConfirmedModel) => void
  onStartOver:  () => void
}

const ELEMENT_LABEL: Record<ProductElement['element_type'], string> = {
  activity: 'Activity',
  feature:  'Feature',
  journey:  'Journey',
  screen:   'Screen',
  system:   'System',
}

const TRIGGER_STYLE: Record<TriggeredArea['status'], string> = {
  triggered:      'bg-amber-500/10 border-amber-500/30',
  not_triggered:  'bg-surface border-border',
  not_applicable: 'bg-surface border-border',
}

export default function MirrorScreen({ draftModel, assessmentId, onConfirm, onStartOver }: Props) {
  function handleConfirm() {
    const confirmed: ConfirmedModel = {
      assessment_id:   assessmentId,
      product_name:    draftModel.product_name,
      elements:        draftModel.elements,
      triggered_areas: draftModel.triggered_areas,
    }
    onConfirm(confirmed)
  }

  const positive  = draftModel.elements.filter(e => !e.is_negative)
  const negative  = draftModel.elements.filter(e =>  e.is_negative)
  const triggered = draftModel.triggered_areas.filter(a => a.status === 'triggered')
  const others    = draftModel.triggered_areas.filter(a => a.status !== 'triggered')

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Here&apos;s what I understand about {draftModel.product_name}
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          Review what I&apos;ve inferred. If something is wrong, start over with a more
          detailed description. Confirm when this looks right.
        </p>
      </div>

      {/* Product elements */}
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs font-semibold text-subtle uppercase tracking-widest">
          Product elements
        </h2>
        <div className="flex flex-col gap-2">
          {positive.map((el, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xs text-subtle font-medium w-16 shrink-0">
                  {ELEMENT_LABEL[el.element_type]}
                </span>
                <span className="text-sm text-foreground">{el.label}</span>
              </div>
              <ConfidenceBadge level={el.confidence} />
            </div>
          ))}
          {negative.map((el, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-surface/50 border border-dashed border-border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xs text-subtle font-medium w-16 shrink-0">
                  {ELEMENT_LABEL[el.element_type]}
                </span>
                <span className="text-sm text-subtle italic">
                  {el.label} — not detected
                </span>
              </div>
              <span className="text-xs text-subtle">add if I missed it</span>
            </div>
          ))}
        </div>
      </section>

      {/* Triggered areas */}
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-xs font-semibold text-subtle uppercase tracking-widest">
          Regulations in scope
        </h2>
        <p className="text-xs text-subtle leading-relaxed -mt-1">
          Only Digital Lending Guidelines (DLG) and KYC / AML findings are generated today —
          other areas below are shown for context, not yet assessed. KYC / AML citations are
          unverified against the current regulation and marked as such in the report.
        </p>
        <div className="flex flex-col gap-2">
          {triggered.map((area, i) => (
            <div key={i} className={`flex items-start justify-between px-4 py-3 border rounded-lg ${TRIGGER_STYLE[area.status]}`}>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-amber-200">{area.area_name}</span>
                <span className="text-xs text-amber-400/70">{area.reason}</span>
                {area.signals.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {area.signals.map((signal, j) => (
                      <span key={j} className="text-[11px] leading-none px-1.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {signal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Badge variant="outline" className="text-xs shrink-0 ml-4 mt-0.5 border-amber-500/40 text-amber-300 bg-amber-500/10">
                In scope
              </Badge>
            </div>
          ))}
          {others.map((area, i) => (
            <div key={i} className={`flex items-start justify-between px-4 py-3 border rounded-lg ${TRIGGER_STYLE[area.status]}`}>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-subtle">{area.area_name}</span>
                <span className="text-xs text-subtle">{area.reason}</span>
              </div>
              <Badge variant="outline" className="text-xs shrink-0 ml-4 mt-0.5">
                Not triggered
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          onClick={onStartOver}
          className="text-sm text-subtle hover:text-muted underline underline-offset-2 transition-colors"
        >
          ← This is wrong, start over
        </button>
        <Button variant="accent" onClick={handleConfirm}>
          Looks right → continue
        </Button>
      </div>
    </div>
  )
}
