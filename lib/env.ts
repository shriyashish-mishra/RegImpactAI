/**
 * Fail-fast environment variable access. Throws a clear, actionable error
 * immediately if a required var is missing, instead of letting downstream
 * SDKs (Supabase, the AI inference engine) surface their own less legible errors.
 */
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}
