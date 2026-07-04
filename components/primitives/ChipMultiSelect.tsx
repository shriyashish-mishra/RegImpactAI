type Props<T extends string> = {
  label: string
  options: readonly T[]
  selected: T[]
  onChange: (next: T[]) => void
}

/**
 * Shared multi-select chip group — used for every multi-select onboarding
 * field (product categories, geographies, target customers, regulated
 * entities, capabilities) instead of duplicating the same toggle-chip
 * markup five times. "(N selected)" in the label makes the selection count
 * legible at a glance without counting chips.
 */
export default function ChipMultiSelect<T extends string>({ label, options, selected, onChange }: Props<T>) {
  function toggle(option: T) {
    onChange(selected.includes(option) ? selected.filter(o => o !== option) : [...selected, option])
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-medium text-subtle uppercase tracking-wide">
        {label} <span className="text-subtle/70 normal-case">({selected.length} selected)</span>
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              aria-pressed={isSelected}
              className={[
                'text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
                isSelected
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-surface-raised border-border text-muted hover:border-subtle hover:text-foreground',
              ].join(' ')}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
