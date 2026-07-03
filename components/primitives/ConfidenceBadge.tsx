import type { ConfidenceLevel } from '@/lib/types'

type Props = {
  level: ConfidenceLevel
}

const STYLES: Record<ConfidenceLevel, string> = {
  high:     'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 print:bg-emerald-50 print:text-emerald-700 print:border-emerald-200',
  moderate: 'bg-amber-500/10   text-amber-300   border-amber-500/30   print:bg-amber-50 print:text-amber-700 print:border-amber-200',
  low:      'bg-surface-raised text-subtle      border-border',
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
