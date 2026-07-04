import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * Native <select>, not a custom-built listbox — no new dependency (no Radix
 * Select installed), and native selects already get correct keyboard nav,
 * screen reader behavior, and mobile OS picker UI for free.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-9 w-full appearance-none rounded-md border border-border bg-surface pl-3 pr-8 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-subtle" aria-hidden="true" />
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }
