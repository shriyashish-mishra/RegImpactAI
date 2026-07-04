-- Tracks the business impact of the AI optimization layer (rule engine +
-- cache) for the admin dashboard's "AI Optimization" section — separate
-- from daily_usage (0009), which tracks the cost-protection quota itself.
-- One row per calendar date, same reset-by-new-row pattern as daily_usage:
-- a new day is a new row, nothing to clean up.
--
-- Processing time columns are milliseconds *summed*, with a paired count,
-- so the admin page computes averages (total / count) rather than storing
-- a running average directly — summing is associative and safe under
-- concurrent writes; a stored running average isn't.
create table if not exists ai_optimization_metrics (
  usage_date              date primary key default current_date,
  cache_hits              int    not null default 0,
  cache_misses            int    not null default 0,
  rule_engine_decisions   int    not null default 0,
  ai_call_ms_total        bigint not null default 0,
  ai_call_count           int    not null default 0,
  ai_tokens_total         bigint not null default 0,
  cached_response_ms_total bigint not null default 0,
  cached_response_count   int    not null default 0
);

-- One flexible atomic increment, called with only the relevant deltas set
-- (everything else defaults to 0) — avoids a separate function per metric
-- while still being a single UPDATE, safe under concurrent writes.
create or replace function record_optimization_metric(
  p_cache_hits int default 0,
  p_cache_misses int default 0,
  p_rule_engine_decisions int default 0,
  p_ai_call_ms bigint default 0,
  p_ai_call_count int default 0,
  p_ai_tokens bigint default 0,
  p_cached_response_ms bigint default 0,
  p_cached_response_count int default 0
) returns void as $$
begin
  insert into ai_optimization_metrics (usage_date)
  values (current_date)
  on conflict (usage_date) do nothing;

  update ai_optimization_metrics
  set cache_hits = cache_hits + p_cache_hits,
      cache_misses = cache_misses + p_cache_misses,
      rule_engine_decisions = rule_engine_decisions + p_rule_engine_decisions,
      ai_call_ms_total = ai_call_ms_total + p_ai_call_ms,
      ai_call_count = ai_call_count + p_ai_call_count,
      ai_tokens_total = ai_tokens_total + p_ai_tokens,
      cached_response_ms_total = cached_response_ms_total + p_cached_response_ms,
      cached_response_count = cached_response_count + p_cached_response_count
  where usage_date = current_date;
end;
$$ language plpgsql;

alter table ai_optimization_metrics disable row level security;
