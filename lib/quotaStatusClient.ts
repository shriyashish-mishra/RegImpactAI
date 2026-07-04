import type { QuotaStatusResponse } from './types'

/**
 * Module-level cache (survives across client-side navigations within the
 * same page load, resets on a hard reload) — avoids re-checking quota every
 * time the user lands back on the homepage. 45s sits in the middle of the
 * "30-60s" window: long enough to skip redundant calls while browsing, short
 * enough that a quota reset or a burst of other users doesn't stay stale.
 */
const CACHE_TTL_MS = 45_000
const FETCH_TIMEOUT_MS = 4_000

let cached: { data: QuotaStatusResponse; expiresAt: number } | null = null
let inflight: Promise<QuotaStatusResponse | null> | null = null

/**
 * Returns null on any failure (network error, timeout, non-200, malformed
 * body) — callers must treat null as "assume quota available." This check
 * is UX only; the server-side check in every AI route is the real
 * enforcement, so failing open here never risks over-spending the budget.
 */
export async function fetchQuotaStatus(): Promise<QuotaStatusResponse | null> {
  const now = Date.now()
  if (cached && cached.expiresAt > now) return cached.data
  if (inflight) return inflight

  inflight = (async () => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    try {
      const res = await fetch('/api/quota-status', { signal: controller.signal })
      if (!res.ok) return null
      const data = (await res.json()) as QuotaStatusResponse
      if (typeof data.exhausted !== 'boolean' || typeof data.resetAt !== 'string') return null
      cached = { data, expiresAt: Date.now() + CACHE_TTL_MS }
      return data
    } catch {
      return null
    } finally {
      clearTimeout(timeout)
      inflight = null
    }
  })()

  return inflight
}
