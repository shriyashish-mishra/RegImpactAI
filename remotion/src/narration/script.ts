/**
 * The single source of truth for caption timing across the whole video:
 * scene durations here drive the Composition's sequence lengths (Root.tsx)
 * and the SRT caption file (generateSubtitles.ts). Change a duration here
 * and both stay in sync.
 *
 * No spoken narration — the story is told entirely through motion,
 * typography, and these captions. One idea per scene, never more, per the
 * creative direction: short, cinematic, calm pacing.
 */

export type CaptionLine = {
  scene: string
  text: string
  durationInSeconds: number
}

export const CAPTIONS: CaptionLine[] = [
  { scene: 'hero', text: 'RegImpact AI', durationInSeconds: 4 },
  { scene: 'problem', text: "Compliance shouldn't take weeks.", durationInSeconds: 5 },
  { scene: 'structured-discovery', text: 'Every product starts with structure.', durationInSeconds: 4 },
  { scene: 'description', text: 'Describe the product. In plain language.', durationInSeconds: 7 },
  { scene: 'mirror', text: 'RegImpact mirrors what it understood.', durationInSeconds: 4 },
  { scene: 'discovery', text: 'Adaptive discovery asks only what matters.', durationInSeconds: 5 },
  { scene: 'architecture', text: "AI runs only where judgment is genuinely needed.", durationInSeconds: 7 },
  { scene: 'assessment', text: 'Every finding is backed by regulatory citations.', durationInSeconds: 8 },
  { scene: 'executive-report', text: 'One score. One recommendation. Full evidence.', durationInSeconds: 8 },
  { scene: 'tech-stack', text: 'Built for modern fintech.', durationInSeconds: 3 },
  { scene: 'closing', text: 'Designed for enterprise compliance.', durationInSeconds: 5 },
]

export const TOTAL_DURATION_SECONDS = CAPTIONS.reduce((sum, l) => sum + l.durationInSeconds, 0)
