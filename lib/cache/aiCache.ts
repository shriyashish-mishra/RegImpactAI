import type { createServerClient } from '@/lib/supabase/server'
import { PROMPT_VERSION, RULE_VERSION, CORPUS_VERSION, ASSESSMENT_VERSION } from '@/lib/ai/versions'

export type CacheStage = 'synthesize' | 'questions' | 'generate'

/**
 * Looks up a cached response for this exact (normalized) input hash, stage,
 * and version set. A version bump anywhere makes every prior entry
 * invisible to this lookup automatically — see supabase/migrations/0010.
 * Returns null on a miss; callers proceed to the real AI call as normal.
 */
export async function getCachedResponse<T>(
  supabase: ReturnType<typeof createServerClient>,
  stage: CacheStage,
  cacheKey: string
): Promise<T | null> {
  const { data } = await supabase
    .from('ai_cache')
    .select('response')
    .eq('cache_key', cacheKey)
    .eq('stage', stage)
    .eq('prompt_version', PROMPT_VERSION)
    .eq('rule_version', RULE_VERSION)
    .eq('corpus_version', CORPUS_VERSION)
    .eq('assessment_version', ASSESSMENT_VERSION)
    .maybeSingle()

  return (data?.response as T | undefined) ?? null
}

/** Stores a fresh AI response under the current version set, keyed for future lookups. */
export async function setCachedResponse(
  supabase: ReturnType<typeof createServerClient>,
  stage: CacheStage,
  cacheKey: string,
  response: unknown
): Promise<void> {
  const { error } = await supabase.from('ai_cache').upsert(
    {
      cache_key: cacheKey,
      stage,
      prompt_version: PROMPT_VERSION,
      rule_version: RULE_VERSION,
      corpus_version: CORPUS_VERSION,
      assessment_version: ASSESSMENT_VERSION,
      response,
    },
    { onConflict: 'cache_key,stage,prompt_version,rule_version,corpus_version,assessment_version' }
  )
  if (error) console.error('[aiCache] Failed to store cache entry (non-fatal):', error)
}

/**
 * Records optimization-layer activity for the admin dashboard. Best-effort
 * and never blocks the response — a metrics write failing shouldn't fail
 * the assessment itself. aiTokens is the real usage.totalTokens the AI SDK
 * already returns on every call — not estimated — so "tokens saved" on the
 * admin page can be grounded in an observed average instead of a guess.
 */
export async function recordOptimizationMetric(
  supabase: ReturnType<typeof createServerClient>,
  deltas: {
    cacheHits?: number
    cacheMisses?: number
    ruleEngineDecisions?: number
    aiCallMs?: number
    aiTokens?: number
    cachedResponseMs?: number
  }
): Promise<void> {
  try {
    await supabase.rpc('record_optimization_metric', {
      p_cache_hits: deltas.cacheHits ?? 0,
      p_cache_misses: deltas.cacheMisses ?? 0,
      p_rule_engine_decisions: deltas.ruleEngineDecisions ?? 0,
      p_ai_call_ms: deltas.aiCallMs ?? 0,
      p_ai_call_count: deltas.aiCallMs !== undefined ? 1 : 0,
      p_ai_tokens: deltas.aiTokens ?? 0,
      p_cached_response_ms: deltas.cachedResponseMs ?? 0,
      p_cached_response_count: deltas.cachedResponseMs !== undefined ? 1 : 0,
    })
  } catch (err) {
    console.error('[aiCache] Failed to record optimization metric (non-fatal):', err)
  }
}

export type OptimizationSnapshot = {
  cacheHits: number
  cacheMisses: number
  ruleEngineDecisions: number
  cacheHitRate: number // 0-100, cacheHits / (cacheHits + cacheMisses)
  avgAiCallMs: number | null
  avgCachedResponseMs: number | null
  estimatedTokensSaved: number
}

// Fixed, disclosed estimate for what a single rule-engine-resolved clause
// would have cost in prompt tokens had it been sent to the AI inference
// engine — there's no way to isolate a real per-clause figure from a
// batched array response, so this stays a labeled estimate rather than
// pretending to precision the data doesn't support.
const ESTIMATED_TOKENS_PER_RULE_DECISION = 120

/** Read-only summary for the admin page's AI Optimization section. */
export async function getOptimizationSnapshot(
  supabase: ReturnType<typeof createServerClient>
): Promise<OptimizationSnapshot> {
  const { data } = await supabase
    .from('ai_optimization_metrics')
    .select('*')
    .eq('usage_date', new Date().toISOString().slice(0, 10))
    .maybeSingle()

  const cacheHits = data?.cache_hits ?? 0
  const cacheMisses = data?.cache_misses ?? 0
  const ruleEngineDecisions = data?.rule_engine_decisions ?? 0
  const aiCallMsTotal = data?.ai_call_ms_total ?? 0
  const aiCallCount = data?.ai_call_count ?? 0
  const aiTokensTotal = data?.ai_tokens_total ?? 0
  const cachedResponseMsTotal = data?.cached_response_ms_total ?? 0
  const cachedResponseCount = data?.cached_response_count ?? 0

  const totalAttempts = cacheHits + cacheMisses
  const avgAiCallMs = aiCallCount > 0 ? Math.round(aiCallMsTotal / aiCallCount) : null
  const avgCachedResponseMs = cachedResponseCount > 0 ? Math.round(cachedResponseMsTotal / cachedResponseCount) : null
  const avgTokensPerRealCall = aiCallCount > 0 ? aiTokensTotal / aiCallCount : 0

  const estimatedTokensSaved = Math.round(
    avgTokensPerRealCall * cacheHits + ESTIMATED_TOKENS_PER_RULE_DECISION * ruleEngineDecisions
  )

  return {
    cacheHits,
    cacheMisses,
    ruleEngineDecisions,
    cacheHitRate: totalAttempts > 0 ? Math.round((cacheHits / totalAttempts) * 100) : 0,
    avgAiCallMs,
    avgCachedResponseMs,
    estimatedTokensSaved,
  }
}
