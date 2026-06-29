import type { GenerateStreamEvent } from '@/lib/types'

/**
 * Safely parses one line from the /api/generate NDJSON stream.
 * Returns null for empty lines or unparseable content — never throws.
 *
 * Usage (in GeneratingScreen):
 *   for await (const line of readLines(reader)) {
 *     const event = parseStreamLine(line)
 *     if (!event) continue
 *     switch (event.type) { ... }
 *   }
 */
export function parseStreamLine(line: string): GenerateStreamEvent | null {
  const trimmed = line.trim()
  if (!trimmed) return null

  try {
    const parsed = JSON.parse(trimmed)

    // Validate the discriminant field exists
    if (typeof parsed !== 'object' || parsed === null) return null
    if (!('type' in parsed)) return null

    const type = parsed.type
    if (
      type !== 'step' &&
      type !== 'finding' &&
      type !== 'done' &&
      type !== 'error'
    ) return null

    return parsed as GenerateStreamEvent
  } catch {
    return null
  }
}

/**
 * Serialises a GenerateStreamEvent to one NDJSON line.
 * Used server-side in /api/generate to write to the stream.
 */
export function encodeStreamLine(event: GenerateStreamEvent): string {
  return JSON.stringify(event) + '\n'
}

/**
 * Async generator that yields lines from a ReadableStream<Uint8Array>.
 * Used in GeneratingScreen to iterate the response body.
 */
export async function* readLines(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      if (buffer.trim()) yield buffer
      break
    }
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    // Keep the last (potentially incomplete) chunk in the buffer
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      yield line
    }
  }
}
