import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser-side Supabase client.
 * Singleton — safe to import from client components.
 * Used by app/report/[id]/page.tsx to fetch persisted findings.
 */
export const supabase = createClient(supabaseUrl, supabaseAnon)
