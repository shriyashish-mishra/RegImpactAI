import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client.
 * Creates a fresh client per call — never a singleton (safe in server context).
 * Used exclusively inside app/api/ route handlers.
 * No RLS in the skeleton — uses the anon key.
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
