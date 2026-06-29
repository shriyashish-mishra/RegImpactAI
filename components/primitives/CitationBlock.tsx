import type { FindingCitation } from '@/lib/types'

type Props = {
  citation: FindingCitation
}

export default function CitationBlock({ citation }: Props) {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-2.5 bg-white/70 border border-slate-200 rounded-lg">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Source
        </span>
        <span className="text-xs text-slate-400">·</span>
        <span className="text-xs text-slate-600 font-medium">{citation.clause_ref}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed italic">
        &ldquo;{citation.clause_text}&rdquo;
      </p>
      <p className="text-xs text-slate-400">{citation.source_title}</p>
    </div>
  )
}
