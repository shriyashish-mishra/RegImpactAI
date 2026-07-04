import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { CAPTIONS } from './script'

/**
 * Generates an SRT file directly from CAPTIONS' timing — no manual sync
 * step, no drift between the on-screen captions and this transcript. The
 * video has no spoken narration, but the caption text is still exported as
 * SRT for accessibility. Run via `npm run generate-subtitles`; re-run any
 * time script.ts changes.
 */

function formatTimestamp(totalSeconds: number): string {
  const ms = Math.round((totalSeconds % 1) * 1000)
  const totalWholeSeconds = Math.floor(totalSeconds)
  const s = totalWholeSeconds % 60
  const m = Math.floor(totalWholeSeconds / 60) % 60
  const h = Math.floor(totalWholeSeconds / 3600)
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`
}

function buildSrt(): string {
  let cursor = 0
  const blocks: string[] = []

  CAPTIONS.forEach((line, i) => {
    const start = cursor
    const end = cursor + line.durationInSeconds
    blocks.push(
      `${i + 1}\n${formatTimestamp(start)} --> ${formatTimestamp(end)}\n${line.text}\n`
    )
    cursor = end
  })

  return blocks.join('\n')
}

function main() {
  const outDir = join(__dirname, '..', '..', 'out')
  mkdirSync(outDir, { recursive: true })
  const srt = buildSrt()
  const outPath = join(outDir, 'regimpact-demo.srt')
  writeFileSync(outPath, srt, 'utf-8')
  console.log(`Wrote ${outPath}`)
}

main()
