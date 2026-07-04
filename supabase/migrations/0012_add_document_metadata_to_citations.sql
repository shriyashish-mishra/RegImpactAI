-- Extends citations with Regulatory Knowledge Base traceability (see
-- lib/knowledgeBase/registry.ts): which document version a clause came
-- from, when that document was published, and which authority issued it.
-- All three are nullable and backward compatible — existing rows simply
-- have NULL here, and lib/report/mapper.ts / CitationBlock.tsx already
-- treat them as optional, so old reports keep rendering exactly as before.
alter table finding_citations
  add column if not exists document_version int,
  add column if not exists publication_date text,
  add column if not exists authority text;
