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
  triggered:      'bg-amber-50 border-amber-200',
  not_triggered:  'bg-slate-50 border-slate-200',
  not_applicable: 'bg-slate-50 border-slate-200',
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
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Here&apos;s what I understand about {draftModel.product_name}
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Review what I&apos;ve inferred. If something is wrong, start over with a more
          detailed description. Confirm when this looks right.
        </p>
      </div>

      {/* Product elements */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Product elements
        </h2>
        <div className="flex flex-col gap-2">
          {positive.map((el, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium w-16 shrink-0">
                  {ELEMENT_LABEL[el.element_type]}
                </span>
                <span className="text-sm text-slate-800">{el.label}</span>
              </div>
              <ConfidenceBadge level={el.confidence} />
            </div>
          ))}
          {negative.map((el, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium w-16 shrink-0">
                  {ELEMENT_LABEL[el.element_type]}
                </span>
                <span className="text-sm text-slate-400 italic">
                  {el.label} — not detected
                </span>
              </div>
              <span className="text-xs text-slate-400">add if I missed it</span>
            </div>
          ))}
        </div>
      </section>

      {/* Triggered areas */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Regulations in scope
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed -mt-1">
          Only Digital Lending Guidelines (DLG) and KYC / AML findings are generated today —
          other areas below are shown for context, not yet assessed. KYC / AML citations are
          unverified against the current regulation and marked as such in the report.
        </p>
        <div className="flex flex-col gap-2">
          {triggered.map((area, i) => (
            <div key={i} className={`flex items-start justify-between px-4 py-3 border rounded-lg ${TRIGGER_STYLE[area.status]}`}>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-amber-900">{area.area_name}</span>
                <span className="text-xs text-amber-700/70">{area.reason}</span>
              </div>
              <Badge variant="outline" className="text-xs shrink-0 ml-4 mt-0.5 border-amber-300 text-amber-700 bg-amber-50">
                In scope
              </Badge>
            </div>
          ))}
          {others.map((area, i) => (
            <div key={i} className={`flex items-start justify-between px-4 py-3 border rounded-lg ${TRIGGER_STYLE[area.status]}`}>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-slate-500">{area.area_name}</span>
                <span className="text-xs text-slate-400">{area.reason}</span>
              </div>
              <Badge variant="outline" className="text-xs shrink-0 ml-4 mt-0.5 border-slate-200 text-slate-400">
                Not triggered
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={onStartOver}
          className="text-sm text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
        >
          ← This is wrong, start over
        </button>
        <Button onClick={handleConfirm}>
          Looks right → continue
        </Button>
      </div>
    </div>
  )
}
