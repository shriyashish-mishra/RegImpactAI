/**
 * Cache correctness depends entirely on these. Every cache entry is keyed
 * partly by these version strings (see lib/cache/aiCache.ts) — bump the
 * relevant one whenever the corresponding thing changes, and every old
 * cache entry is automatically ignored on the next lookup (never deleted,
 * never returned as if it were still valid — see supabase/migrations/0010).
 *
 * Plain string constants, bumped by hand. No hash-of-file-contents
 * auto-versioning — that would catch changes automatically but is a lot
 * more moving parts for a single-owner project where "I changed the
 * prompt, I'll bump the number" is a perfectly reliable discipline.
 */
export const PROMPT_VERSION = 'v1'      // bump when any lib/prompts/* system prompt changes
export const RULE_VERSION = 'v1'        // bump when lib/ruleEngine logic or corpus clause keywords change
export const CORPUS_VERSION = 'v1'      // bump when lib/corpus.ts clause text/set changes
export const ASSESSMENT_VERSION = 'v1'  // bump when Finding/DraftModel/ConfirmedModel response shapes change
