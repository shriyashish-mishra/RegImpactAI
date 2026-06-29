import type { ConfirmedModel } from '@/lib/types'

/**
 * Prompt builders for /api/questions
 * Filled in Milestone 4 when the questions route is implemented.
 */

export function buildQuestionsSystemPrompt(): string {
  // TODO Milestone 4
  return ''
}

export function buildQuestionsUserPrompt(model: ConfirmedModel): string {
  // TODO Milestone 4
  return JSON.stringify(model)
}
