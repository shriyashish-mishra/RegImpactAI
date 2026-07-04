/**
 * Design tokens mirrored from the real app's app/globals.css dark theme —
 * kept as plain values here (not a Tailwind build) because Remotion bundles
 * with its own esbuild pipeline, isolated from the Next.js app. If the
 * site's palette changes, update both places — see README.md.
 */
export const COLORS = {
  background: '#09090b',
  surface: '#18181b',
  surfaceRaised: '#1f1f23',
  border: '#27272a',
  foreground: '#fafafa',
  muted: '#a1a1aa',
  subtle: '#71717a',
  accent: '#34d399',
  accentStrong: '#10b981',
  red: '#f87171',
  amber: '#fbbf24',
}

export const FONT_SANS = 'Inter'
export const FONT_SERIF = 'Playfair Display'
export const FONT_MONO = 'JetBrains Mono'

export const FPS = 60
export const WIDTH = 1920
export const HEIGHT = 1080
