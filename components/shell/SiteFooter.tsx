import { Mail, Globe } from 'lucide-react'
import { PORTFOLIO_URL } from '@/lib/site'

const CONTACT_LINKS = [
  {
    key: 'github',
    href: 'https://github.com/shriyashish-mishra',
    label: 'GitHub',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    href: 'https://www.linkedin.com/in/shriyashish-mishra/',
    label: 'LinkedIn',
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125ZM7.114 20.452H3.56V9h3.554v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    ),
  },
  {
    key: 'portfolio',
    href: PORTFOLIO_URL,
    label: 'Portfolio',
    icon: <Globe size={16} aria-hidden="true" />,
  },
  {
    key: 'email',
    href: 'mailto:shriyashishm@gmail.com',
    label: 'Email',
    icon: <Mail size={16} aria-hidden="true" />,
  },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white print:hidden">
      <div className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">RegImpact AI</span> — AI-Powered Regulatory Compliance Assessment
          </p>
          <p className="text-xs text-slate-400">
            Built by <span className="font-medium text-slate-600">Shriyashish Mishra</span> — Product Manager
          </p>
        </div>
        <div className="flex items-center gap-4">
          {CONTACT_LINKS.map(link => (
            <a
              key={link.key}
              href={link.href}
              target={link.key === 'email' ? undefined : '_blank'}
              rel={link.key === 'email' ? undefined : 'noopener noreferrer'}
              aria-label={link.label}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
