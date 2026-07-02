import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

/**
 * Only static, publicly indexable pages. /report/[id] pages are
 * per-assessment and excluded from robots.txt, so they're excluded here too.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number }[] = [
    { path: '',             priority: 1 },
    { path: '/demo/sample', priority: 0.9 },
    { path: '/case-study',  priority: 0.8 },
    { path: '/architecture', priority: 0.8 },
  ]

  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority,
  }))
}
