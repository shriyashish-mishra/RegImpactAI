import type { createServerClient } from '@/lib/supabase/server'

/**
 * Hard cost protection for AI inference calls (see supabase/migrations/0009).
 *
 * The default of 18 isn't arbitrary: this project's model provider API key
 * is on the free tier, which caps at 20 requests/day across the whole
 * project (observed directly in production — see the quota-exceeded
 * errors this surfaced during testing). Each full assessment costs 3
 * inference calls (synthesize + questions + generate), so 18 leaves a
 * safety margin under the provider's own ceiling rather than racing it
 * exactly. Fully overridable via MAX_DAILY_ASSESSMENTS with no code change.
 */
const DEFAULT_MAX_DAILY_ASSESSMENTS = 18

export function getMaxDailyAssessments(): number {
  const raw = process.env.MAX_DAILY_ASSESSMENTS
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_MAX_DAILY_ASSESSMENTS
}

/** Next UTC midnight — matches Postgres's current_date used in the migration, not a guess at the model provider's own reset schedule. */
export function nextResetAt(): Date {
  const now = new Date()
  const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0))
  return reset
}

export type QuotaResult = {
  allowed:  boolean
  used:     number
  limit:    number
  resetAt:  string // ISO timestamp
}

/**
 * Atomically checks and consumes one unit of today's shared AI-inference
 * call budget. Call this at the top of every route that calls the
 * inference engine (synthesize, questions, generate) — before the model
 * call, never after — so a rejected request never reaches it at all.
 */
export async function checkAndIncrementDailyQuota(
  supabase: ReturnType<typeof createServerClient>
): Promise<QuotaResult> {
  const limit = getMaxDailyAssessments()
  const resetAt = nextResetAt().toISOString()

  const { data, error } = await supabase.rpc('increment_daily_usage', { p_limit: limit })
  if (error || !data || data.length === 0) {
    // Fail closed on infrastructure error — protecting the quota matters
    // more than availability for a $0-budget portfolio project.
    console.error('[quota] Failed to check daily quota, failing closed:', error)
    return { allowed: false, used: limit, limit, resetAt }
  }

  const row = data[0] as { allowed: boolean; used: number }
  return { allowed: row.allowed, used: row.used, limit, resetAt }
}

/** Read-only status for the admin page — never increments. */
export async function getDailyQuotaStatus(
  supabase: ReturnType<typeof createServerClient>
): Promise<QuotaResult> {
  const limit = getMaxDailyAssessments()
  const resetAt = nextResetAt().toISOString()

  const { data } = await supabase
    .from('daily_usage')
    .select('assessment_count')
    .eq('usage_date', new Date().toISOString().slice(0, 10))
    .maybeSingle()

  return { allowed: (data?.assessment_count ?? 0) < limit, used: data?.assessment_count ?? 0, limit, resetAt }
}
