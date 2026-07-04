-- Hard cost protection: a shared daily counter of AI-inference-calling
-- requests (synthesize + questions + generate all draw from the same
-- counter, since all three cost real API quota/tokens — gating only the
-- entry point would leave the other two routes callable directly with no
-- limit). Once the configured daily limit is reached, the app must refuse
-- to call the inference engine at all rather than let the call through
-- and fail downstream.
--
-- One row per calendar date (UTC, matching Postgres's default session
-- timezone on Supabase) — a new day means a new row, which is the reset:
-- no cron job needed, nothing to remember to run.

create table if not exists daily_usage (
  usage_date        date primary key default current_date,
  assessment_count  int  not null default 0
);

-- Atomically checks the limit and increments in one statement, so concurrent
-- requests can't both read "9 of 10 used" and both proceed, pushing the
-- real count to 11. Returns allowed = false without incrementing once the
-- limit is reached, leaving assessment_count exactly at p_limit forever
-- (not counting rejected attempts) so the admin page always shows a real,
-- bounded number of actual AI inference calls made today.
create or replace function increment_daily_usage(p_limit int)
returns table (allowed boolean, used int) as $$
declare
  v_new_count int;
begin
  insert into daily_usage (usage_date, assessment_count)
  values (current_date, 0)
  on conflict (usage_date) do nothing;

  update daily_usage
  set assessment_count = assessment_count + 1
  where usage_date = current_date and assessment_count < p_limit
  returning assessment_count into v_new_count;

  if v_new_count is null then
    select assessment_count into v_new_count from daily_usage where usage_date = current_date;
    return query select false, v_new_count;
  else
    return query select true, v_new_count;
  end if;
end;
$$ language plpgsql;

alter table daily_usage disable row level security;
