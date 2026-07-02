import type { Metadata } from 'next'
import './globals.css'
import { SITE_URL } from '@/lib/site'
import SiteFooter from '@/components/shell/SiteFooter'

const SITE_NAME = 'RegImpact AI'
const TITLE = 'RegImpact AI — AI Compliance Assessment for Indian Fintech'
const DESCRIPTION =
  'AI-powered Regulatory Impact Assessment for Indian fintech — every finding is backed by a verified regulatory citation.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
