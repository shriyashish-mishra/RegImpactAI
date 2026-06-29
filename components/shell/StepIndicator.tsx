type Props = {
  currentStep: 1 | 2 | 3 | 4 | 5
}

const STEPS = ['Describe', 'Understand', 'Discover', 'Assess', 'Report']

export default function StepIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((label, i) => {
        const stepNum  = i + 1
        const isComplete = stepNum < currentStep
        const isActive   = stepNum === currentStep
        const isUpcoming = stepNum > currentStep

        return (
          <div key={label} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                isComplete ? 'bg-slate-800 text-white'                          : '',
                isActive   ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'  : '',
                isUpcoming ? 'bg-slate-100 text-slate-400'                      : '',
              ].join(' ')}>
                {isComplete ? '✓' : stepNum}
              </div>
              <span className={[
                'text-xs font-medium whitespace-nowrap',
                isComplete ? 'text-slate-600'  : '',
                isActive   ? 'text-indigo-600' : '',
                isUpcoming ? 'text-slate-400'  : '',
              ].join(' ')}>
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className={[
                'h-px flex-1 mx-2 mb-4 transition-colors',
                stepNum < currentStep ? 'bg-slate-800' : 'bg-slate-200',
              ].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
