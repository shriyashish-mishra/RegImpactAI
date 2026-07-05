import Link from 'next/link'
import { LINKEDIN_URL, PORTFOLIO_URL } from '@/lib/site'

type NavKey = 'home' | 'live' | 'sample' | 'case-study' | 'architecture' | 'knowledge-base'

type Props = {
  current?: NavKey
}

const LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: 'live',           href: '/',               label: 'Try Live' },
  { key: 'sample',         href: '/demo/sample',    label: 'Sample Report' },
  { key: 'case-study',     href: '/case-study',     label: 'Case Study' },
  { key: 'architecture',   href: '/architecture',   label: 'Architecture' },
  { key: 'knowledge-base', href: '/knowledge-base', label: 'Knowledge Base' },
]

const EXTERNAL_LINKS = [
  { key: 'work',     href: PORTFOLIO_URL, label: 'Work' },
  { key: 'linkedin', href: LINKEDIN_URL,  label: 'LinkedIn' },
]

export default function SiteHeader({ current = 'home' }: Props) {
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-x-6 gap-y-2">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-accent text-zinc-950 text-xs font-bold font-mono">
            R
          </span>
          <span className="text-sm font-semibold text-foreground tracking-tight">
            RegImpact AI
          </span>
        </Link>
        <nav className="flex items-center flex-wrap gap-x-5 gap-y-1.5">
          {LINKS.map(link => (
            <Link
              key={link.key}
              href={link.href}
              className={[
                'text-xs font-medium transition-colors whitespace-nowrap',
                current === link.key
                  ? 'text-accent'
                  : 'text-muted hover:text-foreground',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
          <span className="w-px h-3.5 bg-border" aria-hidden="true" />
          {EXTERNAL_LINKS.map(link => (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-muted hover:text-foreground transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
