type Props = {
  steps:    string[]
  complete: boolean
}

export default function NarratedProgress({ steps, complete }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Assessment progress"
      className="flex flex-col gap-2 px-4 py-4 bg-slate-900 rounded-xl"
    >
      {steps.length === 0 && (
        <span className="text-xs text-slate-500 font-mono animate-pulse">
          Initialising assessment…
        </span>
      )}
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const done   = complete || !isLast
        return (
          <div key={i} className="flex items-start gap-2.5">
            <span aria-hidden="true" className={[
              'text-xs mt-0.5 shrink-0',
              done        ? 'text-emerald-400' : 'text-slate-500 animate-pulse',
            ].join(' ')}>
              {done ? '✓' : '⟳'}
            </span>
            <span className={[
              'text-xs leading-relaxed font-mono',
              isLast && !complete ? 'text-white' : 'text-slate-500',
            ].join(' ')}>
              <span className="sr-only">{done ? 'Done: ' : 'In progress: '}</span>
              {step}
            </span>
          </div>
        )
      })}
    </div>
  )
}
