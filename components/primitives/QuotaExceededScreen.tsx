'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Props = {
  resetAt: string
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

/**
 * Shown instead of a raw error whenever any AI-inference-calling route
 * (synthesize, questions, generate) rejects a request because
 * lib/quota.ts's daily limit is exhausted. resetAt is RegImpact's own
 * reset time (next UTC midnight), never a guess at the model provider's
 * own quota window.
 */
export default function QuotaExceededScreen({ resetAt }: Props) {
  const [remaining, setRemaining] = useState(() => new Date(resetAt).getTime() - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(new Date(resetAt).getTime() - Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [resetAt])

  return (
    <div className="flex flex-col gap-6 px-6 py-10 bg-surface border border-border rounded-xl items-center text-center">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          Today&apos;s live AI assessment capacity has been fully utilized
        </h2>
        <p className="text-sm text-muted max-w-md leading-relaxed">
          To keep RegImpact free for everyone, live assessments are temporarily paused.
        </p>
      </div>

      <div className="flex flex-col gap-1 items-center">
        <span className="text-xs font-medium text-subtle uppercase tracking-wide">Next refresh</span>
        <span className="text-2xl font-mono font-semibold text-accent tabular-nums">
          {formatRemaining(remaining)}
        </span>
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t border-border w-full max-w-xs">
        <span className="text-xs text-subtle">In the meantime you can explore</span>
        <div className="flex flex-col gap-2">
          <Link href="/demo/sample" className="text-sm font-medium text-accent hover:underline underline-offset-2">
            Interactive Sample Report →
          </Link>
          <Link href="/architecture" className="text-sm font-medium text-accent hover:underline underline-offset-2">
            Architecture →
          </Link>
          <Link href="/case-study" className="text-sm font-medium text-accent hover:underline underline-offset-2">
            Product Case Study →
          </Link>
        </div>
      </div>
    </div>
  )
}
