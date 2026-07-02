-- Tracks whether a citation's underlying corpus clause text has been
-- verified against its source document (see lib/corpus.ts and
-- lib/types.ts CorpusClause.verified). Defaults to true so existing rows
-- (all DLG, all verified) keep their correct value; new inserts always pass
-- the real value resolved server-side in app/api/generate/route.ts.

alter table finding_citations
  add column if not exists verified boolean not null default true;
