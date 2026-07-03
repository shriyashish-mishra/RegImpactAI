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
 * Shown instead of a raw error whenever any Gemini-calling route (synthesize,
 * questions, generate) rejects a request because lib/quota.ts's daily limit
 * is exhausted. resetAt is RegImpact's own reset time (next UTC midnight),
 * never a guess at Google's own quota window.
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
    <div className="flex flex-col gap-6 px-6 py-10 bg-white border border-slate-200 rounded-xl items-center text-center">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Today&apos;s live AI assessment capacity has been fully utilized
        </h2>
        <p className="text-sm text-slate-500 max-w-md leading-relaxed">
          To keep RegImpact free for everyone, live assessments are temporarily paused.
        </p>
      </div>

      <div className="flex flex-col gap-1 items-center">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Next refresh</span>
        <span className="text-2xl font-mono font-semibold text-slate-900 tabular-nums">
          {formatRemaining(remaining)}
        </span>
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 w-full max-w-xs">
        <span className="text-xs text-slate-500">In the meantime you can explore</span>
        <div className="flex flex-col gap-2">
          <Link href="/demo/sample" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
            Interactive Sample Report →
          </Link>
          <Link href="/architecture" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
            Architecture →
          </Link>
          <Link href="/case-study" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
            Product Case Study →
          </Link>
        </div>
      </div>
    </div>
  )
}
