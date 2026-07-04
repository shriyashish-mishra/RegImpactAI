import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { LanguageModel } from 'ai'

/**
 * The ONLY file in this codebase allowed to name a specific AI provider or
 * import a provider-specific SDK. Every route, prompt builder, and UI
 * surface — the assessment pipeline, the admin dashboard, the architecture
 * page — must refer to this only as "the AI inference engine" or similar,
 * never by provider name. The product should never expose which model is
 * doing the work; that's an implementation detail, not something a user
 * (or a recruiter reading the source) needs to know.
 *
 * Swapping providers later means changing this file alone: implement
 * getInferenceModel() against the new SDK, keep the same return type
 * (LanguageModel, from the provider-agnostic 'ai' package), and nothing
 * downstream — routes, prompts, Zod schemas, UI — needs to change.
 */
const MODEL_ID = 'gemini-2.5-flash'

function resolveApiKey(): string | undefined {
  // AI_INFERENCE_API_KEY is the documented, provider-neutral env var name
  // for new setups. GOOGLE_GENERATIVE_AI_API_KEY is kept as a silent
  // fallback purely so an already-deployed environment variable keeps
  // working — new setups should only ever set AI_INFERENCE_API_KEY.
  return process.env.AI_INFERENCE_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY
}

export function hasInferenceCredentials(): boolean {
  return Boolean(resolveApiKey())
}

export function getInferenceModel(): LanguageModel {
  const apiKey = resolveApiKey()
  if (!apiKey) {
    throw new Error('Missing required environment variable: AI_INFERENCE_API_KEY')
  }
  const provider = createGoogleGenerativeAI({ apiKey })
  return provider(MODEL_ID)
}
