import Link from 'next/link'

type NavKey = 'home' | 'sample' | 'case-study' | 'architecture'

type Props = {
  current?: NavKey
}

const LINKS: { key: NavKey; href: string; label: string }[] = [
  { key: 'sample',       href: '/demo/sample', label: 'Sample Report' },
  { key: 'case-study',   href: '/case-study',   label: 'Case Study' },
  { key: 'architecture', href: '/architecture', label: 'Architecture' },
]

export default function SiteHeader({ current = 'home' }: Props) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-slate-900 tracking-tight">
          RegImpact AI
        </Link>
        <nav className="flex items-center gap-5">
          {LINKS.map(link => (
            <Link
              key={link.key}
              href={link.href}
              className={[
                'text-xs font-medium transition-colors',
                current === link.key
                  ? 'text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
