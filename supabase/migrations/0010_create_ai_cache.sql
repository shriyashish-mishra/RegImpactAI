-- Stage cache for the AI inference layer (see lib/cache/aiCache.ts). Each
-- of the three AI-calling stages (synthesize, questions, generate) caches
-- independently, keyed on a hash of the normalized inputs for that stage
-- plus the versions that were active when it was computed.
--
-- Versioning is why nothing is ever deleted: prompt_version/rule_version/
-- corpus_version are part of the lookup key, so bumping any of them in
-- lib/ai/versions.ts makes every existing row simply stop matching new
-- lookups — old entries are inert, not stale-but-still-returned. No cron
-- job, no manual invalidation step to forget to run.
create table if not exists ai_cache (
  id               uuid primary key default gen_random_uuid(),
  cache_key        text not null,
  stage            text not null check (stage in ('synthesize', 'questions', 'generate')),
  prompt_version   text not null,
  rule_version     text not null,
  corpus_version   text not null,
  assessment_version text not null,
  response         jsonb not null,
  created_at       timestamptz not null default now()
);

create unique index if not exists idx_ai_cache_lookup
  on ai_cache (cache_key, stage, prompt_version, rule_version, corpus_version, assessment_version);

alter table ai_cache disable row level security;
