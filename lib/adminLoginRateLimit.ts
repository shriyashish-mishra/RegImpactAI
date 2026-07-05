import type { createServerClient } from '@/lib/supabase/server'

/**
 * Per-IP rate limiting for /api/admin/login (see supabase/migrations/0013).
 * The password comparison itself was already timing-safe (lib/adminSession.ts)
 * — this stops the actual gap: nothing previously limited how many guesses
 * an attacker could make over the network.
 */
const MAX_ATTEMPTS = 5
const WINDOW_SECONDS = 15 * 60

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || 'unknown'
}

/** Fails closed on infrastructure error — same posture as lib/quota.ts, and for the same reason: a rate limit that fails open isn't a rate limit. */
export async function checkAndIncrementLoginAttempt(
  supabase: ReturnType<typeof createServerClient>,
  ip: string
): Promise<{ allowed: boolean; attempts: number }> {
  const { data, error } = await supabase.rpc('check_and_increment_login_attempt', {
    p_ip: ip,
    p_max_attempts: MAX_ATTEMPTS,
    p_window_seconds: WINDOW_SECONDS,
  })

  if (error || !data || data.length === 0) {
    console.error('[adminLoginRateLimit] Failed to check login rate limit, failing closed:', error)
    return { allowed: false, attempts: MAX_ATTEMPTS }
  }

  return data[0] as { allowed: boolean; attempts: number }
}

/** Best-effort — a failed reset just means a successful login leaves the counter as-is, never blocks the login that already succeeded. */
export async function resetLoginAttempts(
  supabase: ReturnType<typeof createServerClient>,
  ip: string
): Promise<void> {
  const { error } = await supabase.rpc('reset_login_attempts', { p_ip: ip })
  if (error) console.error('[adminLoginRateLimit] Failed to reset login attempts:', error)
}
