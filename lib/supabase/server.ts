import { createClient } from '@supabase/supabase-js'
import { requireEnv } from '@/lib/env'

/**
 * Server-side Supabase client.
 * Creates a fresh client per call — never a singleton (safe in server context).
 * Used exclusively inside app/api/ route handlers.
 * No RLS in the skeleton — uses the anon key.
 *
 * Reads SUPABASE_URL / SUPABASE_ANON_KEY (no NEXT_PUBLIC_ prefix) —
 * this client only ever runs server-side, and these are exactly the names
 * Vercel's Supabase integration provisions automatically when a project is
 * connected via the dashboard.
 */
export function createServerClient() {
  return createClient(
    requireEnv('SUPABASE_URL'),
    requireEnv('SUPABASE_ANON_KEY')
  )
}
