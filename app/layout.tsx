import type { Metadata } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SITE_URL } from '@/lib/site'
import SiteFooter from '@/components/shell/SiteFooter'

// Sans for body/nav/UI, serif for large display titles only (hero headings),
// mono for uppercase section labels ("V_01 / STRATEGIES") — matches the
// three-font pattern in the design reference. All three are self-hosted by
// Next.js at build time (next/font), not a new dependency or a runtime
// Google Fonts request.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

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
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-foreground antialiased font-sans">
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
