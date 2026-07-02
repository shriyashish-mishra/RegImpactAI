import { createClient } from '@supabase/supabase-js'
import { requireEnv } from '@/lib/env'

/**
 * Server-side Supabase client.
 * Creates a fresh client per call — never a singleton (safe in server context).
 * Used exclusively inside app/api/ route handlers.
 * No RLS in the skeleton — uses the anon key.
 */
export function createServerClient() {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )
}
