import { createHash } from 'node:crypto'

/**
 * Normalization for cache keys — the whole point is that two requests a
 * human would consider "the same assessment" hash identically even if the
 * raw JSON differs: different capitalization, extra whitespace, or
 * multi-select values submitted in a different order.
 */

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')            // collapse repeated whitespace
    .replace(/[.,!?;:'"“”‘’]/g, '')  // strip punctuation that doesn't change meaning
}

function normalizeList(values: string[]): string[] {
  return [...values].map(normalizeText).sort()
}

/**
 * Recursively normalizes a plain JSON-serializable value: strings get
 * normalizeText, arrays of strings get normalizeList (sorted), arrays of
 * objects are normalized element-wise then sorted by their own JSON form
 * (order-independent for multi-select-shaped arrays), object keys are
 * sorted so key order in the source never affects the hash, and booleans/
 * numbers pass through unchanged.
 */
function normalizeValue(value: unknown): unknown {
  if (typeof value === 'string') return normalizeText(value)
  if (typeof value === 'boolean' || typeof value === 'number' || value === null) return value

  if (Array.isArray(value)) {
    if (value.every(v => typeof v === 'string')) {
      return normalizeList(value as string[])
    }
    const normalized = value.map(normalizeValue)
    return [...normalized].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, normalizeValue(v)] as const)
    return Object.fromEntries(entries)
  }

  return value
}

/** Deterministic SHA-256 hash of a normalized, JSON-serializable payload. */
export function hashPayload(payload: unknown): string {
  const normalized = normalizeValue(payload)
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
}
