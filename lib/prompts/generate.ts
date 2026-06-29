import type { ConfirmedModel, Question, CorpusClause } from '@/lib/types'

/**
 * Prompt builders for /api/generate
 * Filled in Milestone 5 when the generate route is implemented.
 */

export function buildGenerateSystemPrompt(): string {
  // TODO Milestone 5
  return ''
}

export function buildGenerateUserPrompt(
  model: ConfirmedModel,
  questions: Question[],
  clauses: CorpusClause[]
): string {
  // TODO Milestone 5
  return JSON.stringify({ model, questions, clauses })
}
