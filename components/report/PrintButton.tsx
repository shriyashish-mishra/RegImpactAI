'use client'

/**
 * PDF export via the browser's native print-to-PDF, not a server-rendered
 * PDF library — no new dependency, works everywhere, and print.css (see
 * app/globals.css) already hides site chrome and preserves finding colors
 * for print output.
 */
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden text-sm font-medium text-accent hover:underline underline-offset-2 transition-colors"
    >
      Download PDF
    </button>
  )
}
