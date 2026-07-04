// Report history — protected by proxy.ts, not linked from the public site.
// Single-owner admin view: lists every assessment ever created, most recent
// first, with a finding count and a link to its full report.

import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { getDailyQuotaStatus } from '@/lib/quota'
import AdminLogoutButton from '@/components/admin/AdminLogoutButton'

export const metadata: Metadata = {
  title: 'Admin — RegImpact AI',
  robots: { index: false, follow: false },
}

// Always request-time: reads live assessment data behind the proxy.ts
// cookie gate, and would otherwise fail at build time with no env vars set.
export const dynamic = 'force-dynamic'

type AssessmentListRow = {
  id: string
  product_name: string
  description: string
  created_at: string
  findings: { count: number }[]
}

export default async function AdminPage() {
  const supabase = createServerClient()
  const [{ data, error }, quota] = await Promise.all([
    supabase
      .from('assessments')
      .select('id, product_name, description, created_at, findings(count)')
      .order('created_at', { ascending: false }),
    getDailyQuotaStatus(supabase),
  ])

  const assessments = (data ?? []) as AssessmentListRow[]
  const remaining = Math.max(0, quota.limit - quota.used)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground tracking-tight">
            Report history
          </span>
          <AdminLogoutButton />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border rounded-lg overflow-hidden">
          <div className="bg-surface px-4 py-3 flex flex-col gap-1">
            <span className="font-mono text-[11px] font-medium text-subtle uppercase tracking-wide">Used today</span>
            <span className="text-lg font-semibold text-foreground">{quota.used}</span>
          </div>
          <div className="bg-surface px-4 py-3 flex flex-col gap-1">
            <span className="font-mono text-[11px] font-medium text-subtle uppercase tracking-wide">Remaining</span>
            <span className="text-lg font-semibold text-accent">{remaining}</span>
          </div>
          <div className="bg-surface px-4 py-3 flex flex-col gap-1">
            <span className="font-mono text-[11px] font-medium text-subtle uppercase tracking-wide">Daily limit</span>
            <span className="text-lg font-semibold text-foreground">{quota.limit}</span>
          </div>
          <div className="bg-surface px-4 py-3 flex flex-col gap-1">
            <span className="font-mono text-[11px] font-medium text-subtle uppercase tracking-wide">Next reset</span>
            <span className="text-sm font-semibold text-foreground">
              {new Date(quota.resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
            </span>
          </div>
        </div>
        <p className="text-xs text-subtle pt-2">
          Counts every AI inference call across synthesize, questions, and generate combined — not just completed assessments. See MAX_DAILY_ASSESSMENTS in .env.example.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 flex flex-col gap-4">
        {error && (
          <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3">
            Failed to load assessments: {error.message}
          </p>
        )}

        {!error && assessments.length === 0 && (
          <p className="text-sm text-muted">No assessments yet.</p>
        )}

        {assessments.map(a => (
          <Link
            key={a.id}
            href={`/report/${a.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 bg-surface border border-border rounded-lg hover:border-accent transition-colors"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">{a.product_name}</span>
              <span className="text-xs text-subtle truncate">{a.description}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-muted">
                {a.findings?.[0]?.count ?? 0} finding{(a.findings?.[0]?.count ?? 0) === 1 ? '' : 's'}
              </span>
              <span className="text-xs text-subtle">
                {new Date(a.created_at).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
