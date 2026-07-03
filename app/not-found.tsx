import Link from 'next/link'
import SiteHeader from '@/components/shell/SiteHeader'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-24 flex flex-col items-center gap-4 text-center">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">404</span>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Page not found</h1>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
          That page doesn&apos;t exist. Here&apos;s where you probably meant to go instead.
        </p>
        <div className="flex flex-col gap-2 pt-4">
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
            Start a live assessment →
          </Link>
          <Link href="/demo/sample" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
            View the sample report →
          </Link>
          <Link href="/case-study" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline underline-offset-2">
            Read the case study →
          </Link>
        </div>
      </div>
    </div>
  )
}
