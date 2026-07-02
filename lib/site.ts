/**
 * Canonical site URL — used for metadataBase, OG tags, robots.txt, and the sitemap.
 * Falls back to the known production URL so these all work without extra config.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reg-impact-ai.vercel.app'

/** Repo link shown in SiteHeader. Falls back to the known repo so it works without extra config. */
export const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com/shriyashish-mishra/RegImpactAI'
