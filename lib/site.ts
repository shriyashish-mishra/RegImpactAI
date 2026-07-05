/**
 * Canonical site URL — used for metadataBase, OG tags, robots.txt, and the sitemap.
 * Falls back to the known production URL so these all work without extra config.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reg-impact-ai.vercel.app'

/** Creator's personal portfolio site, shown in SiteHeader/SiteFooter. */
export const PORTFOLIO_URL = 'https://shriyashish.lovable.app'

/** Creator's LinkedIn, shown in SiteHeader/SiteFooter. */
export const LINKEDIN_URL = 'https://www.linkedin.com/in/shriyashish-mishra/'
