-- Milestone 1 (vertical slice): recommendations and finding_citations tables
-- recommendations matches lib/types.ts RecommendationRow exactly — note this
-- repo's current schema has no `status` column; Finding.recommendations is
-- plain string[] in memory, reconstructed by sorting recommendations by
-- priority and taking just the text.
--
-- finding_citations.clause_text is denormalised by design (matches
-- FindingCitationRow) — display convenience, not a stale-data risk for
-- this milestone's scope.

create table if not exists recommendations (
  id         uuid primary key default gen_random_uuid(),
  finding_id uuid not null references findings(id) on delete cascade,
  text       text not null,
  priority   int  not null default 1
);

create index if not exists idx_recommendations_finding_id on recommendations(finding_id);

create table if not exists finding_citations (
  id               uuid primary key default gen_random_uuid(),
  finding_id       uuid not null references findings(id) on delete cascade,
  corpus_clause_id uuid not null,
  clause_ref       text not null,
  clause_text      text not null,
  source_title     text not null
);

create index if not exists idx_finding_citations_finding_id on finding_citations(finding_id);
