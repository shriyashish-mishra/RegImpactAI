import type { ConfidenceLevel } from '@/lib/types'

type Props = {
  level: ConfidenceLevel
}

const STYLES: Record<ConfidenceLevel, string> = {
  high:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  moderate: 'bg-amber-50   text-amber-700   border-amber-200',
  low:      'bg-slate-100  text-slate-500   border-slate-200',
}

const LABELS: Record<ConfidenceLevel, string> = {
  high:     'High confidence',
  moderate: 'Moderate confidence',
  low:      'Low confidence',
}

export default function ConfidenceBadge({ level }: Props) {
  return (
    <span className={[
      'inline-flex items-center px-2 py-0.5 rounded-full border',
      'text-xs font-medium whitespace-nowrap',
      STYLES[level],
    ].join(' ')}>
      {LABELS[level]}
    </span>
  )
}
