// Report history — protected by proxy.ts, not linked from the public site.
// Single-owner admin view: lists every assessment ever created, most recent
// first, with a finding count and a link to its full report.

import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
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
  const { data, error } = await supabase
    .from('assessments')
    .select('id, product_name, description, created_at, findings(count)')
    .order('created_at', { ascending: false })

  const assessments = (data ?? []) as AssessmentListRow[]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900 tracking-tight">
            Report history
          </span>
          <AdminLogoutButton />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 flex flex-col gap-4">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            Failed to load assessments: {error.message}
          </p>
        )}

        {!error && assessments.length === 0 && (
          <p className="text-sm text-slate-500">No assessments yet.</p>
        )}

        {assessments.map(a => (
          <Link
            key={a.id}
            href={`/report/${a.id}`}
            className="flex items-center justify-between gap-4 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-slate-800 truncate">{a.product_name}</span>
              <span className="text-xs text-slate-400 truncate">{a.description}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-500">
                {a.findings?.[0]?.count ?? 0} finding{(a.findings?.[0]?.count ?? 0) === 1 ? '' : 's'}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(a.created_at).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
