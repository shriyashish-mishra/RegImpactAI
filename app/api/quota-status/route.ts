import { createServerClient } from '@/lib/supabase/server'
import { getDailyQuotaStatus } from '@/lib/quota'
import type { QuotaStatusResponse } from '@/lib/types'

export const dynamic = 'force-dynamic'

/**
 * Read-only quota check the homepage calls before onboarding starts, so
 * nobody spends time filling in the form only to hit quota_exceeded at
 * /api/synthesize. A single read of daily_usage — never increments the
 * counter and never calls the AI inference engine (contrast with
 * checkAndIncrementDailyQuota, used by the actual assessment routes).
 *
 * This is UX only: the client fails open on any non-200 response, and the
 * server-side check in every AI route remains the real enforcement.
 */
export async function GET() {
  try {
    const supabase = createServerClient()
    const quota = await getDailyQuotaStatus(supabase)
    const response: QuotaStatusResponse = {
      exhausted: !quota.allowed,
      remaining: Math.max(0, quota.limit - quota.used),
      resetAt: quota.resetAt,
    }
    return Response.json(response)
  } catch (err) {
    console.error('[quota-status] Failed to read quota status:', err)
    return Response.json({ error: 'unavailable' }, { status: 503 })
  }
}
