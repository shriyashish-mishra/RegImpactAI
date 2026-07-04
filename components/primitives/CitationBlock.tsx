import type { FindingCitation } from '@/lib/types'

type Props = {
  citation: FindingCitation
}

export default function CitationBlock({ citation }: Props) {
  return (
    <div className={[
      'flex flex-col gap-1.5 px-3 py-2.5 border rounded-lg',
      citation.verified
        ? 'bg-surface-raised/70 border-border'
        : 'bg-amber-500/5 border-amber-500/30 print:bg-amber-50/70 print:border-amber-200',
    ].join(' ')}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-subtle uppercase tracking-wide">
          Source
        </span>
        <span className="text-xs text-subtle">·</span>
        <span className="text-xs text-muted font-medium">{citation.clause_ref}</span>
        {!citation.verified && (
          <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5 print:text-amber-700 print:bg-amber-100 print:border-amber-200">
            Unverified — needs legal review
          </span>
        )}
      </div>
      <p className="text-xs text-subtle leading-relaxed italic">
        &ldquo;{citation.clause_text}&rdquo;
      </p>
      <p className="text-xs text-subtle">{citation.source_title}</p>
      {/* Absent (null) on citations persisted before the Knowledge Base
          model existed — renders nothing extra for those, exactly as
          before. */}
      {(citation.document_version !== null || citation.publication_date !== null || citation.authority !== null) && (
        <p className="text-[11px] text-subtle/80 flex flex-wrap gap-x-2">
          {citation.authority && <span>{citation.authority}</span>}
          {citation.document_version !== null && <span>· Version {citation.document_version}</span>}
          {citation.publication_date && <span>· Published {citation.publication_date}</span>}
        </p>
      )}
    </div>
  )
}
