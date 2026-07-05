import { Mail, Globe } from 'lucide-react'
import { PORTFOLIO_URL, LINKEDIN_URL } from '@/lib/site'

const CONTACT_LINKS = [
  {
    key: 'linkedin',
    href: LINKEDIN_URL,
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
    <footer className="border-t border-border bg-background print:hidden">
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted">
            <span className="font-semibold text-foreground">RegImpact AI</span> — AI-Powered Regulatory Compliance Assessment
          </p>
          <p className="text-xs text-subtle">
            Built by <span className="font-medium text-muted">Shriyashish Mishra</span> — AI Product Management Portfolio
          </p>
          <p className="text-[10px] text-subtle/70 font-mono uppercase tracking-widest pt-0.5">
            FinTech · RegTech · RAG · Explainable AI
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
              className="text-subtle hover:text-accent transition-colors"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
