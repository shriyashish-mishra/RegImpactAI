import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RegImpact AI',
  description: 'AI-powered Regulatory Impact Assessment for Indian Fintech',
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
      </body>
    </html>
  )
}
