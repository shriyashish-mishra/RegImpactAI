import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // High-contrast dark button, not green — green is reserved for
        // accent (below). Matches the "Get In Touch" header CTA pattern.
        default: 'bg-surface text-foreground border border-border hover:border-subtle hover:bg-surface-raised',
        // The one place solid green fill is used — sparingly, for the single
        // most important action on a screen (matches the "Report" pipeline
        // stage's filled-green treatment in the reference).
        accent:  'bg-accent text-zinc-950 hover:bg-accent-strong',
        outline: 'border border-border bg-transparent text-muted hover:border-subtle hover:text-foreground',
        ghost:   'text-muted hover:bg-surface hover:text-foreground',
        link:    'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-8 rounded-md px-3 text-xs',
        lg:      'h-10 rounded-md px-8',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
