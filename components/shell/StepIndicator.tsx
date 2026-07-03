type Props = {
  currentStep: 1 | 2 | 3 | 4 | 5
}

const STEPS = ['Describe', 'Understand', 'Discover', 'Assess', 'Report']

export default function StepIndicator({ currentStep }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full">
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
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold font-mono transition-all duration-200',
                  isComplete ? 'bg-surface-raised text-foreground border border-border' : '',
                  isActive   ? 'bg-accent text-zinc-950 ring-2 ring-accent/30'          : '',
                  isUpcoming ? 'bg-surface text-subtle border border-border'            : '',
                ].join(' ')}>
                  {isComplete ? '✓' : stepNum}
                </div>
                {/* Labels hide below sm: on narrow phone widths five fixed-width
                    labels would overflow the row; the caption below the row
                    (mobile-only) tells the user which step they're on instead. */}
                <span className={[
                  'hidden sm:inline text-xs font-medium whitespace-nowrap',
                  isComplete ? 'text-muted'  : '',
                  isActive   ? 'text-accent' : '',
                  isUpcoming ? 'text-subtle' : '',
                ].join(' ')}>
                  {label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div className={[
                  'h-px flex-1 mx-2 mb-4 transition-colors duration-200',
                  stepNum < currentStep ? 'bg-accent/40' : 'bg-border',
                ].join(' ')} />
              )}
            </div>
          )
        })}
      </div>

      <p className="sm:hidden text-xs font-medium text-accent text-center">
        Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]}
      </p>
    </div>
  )
}
