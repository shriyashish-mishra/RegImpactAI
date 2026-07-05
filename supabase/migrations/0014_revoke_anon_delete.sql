-- Partial RLS mitigation, ahead of a full RLS project (tracked separately —
-- see supabase/migrations/README.md's note on 0007). RLS itself stays
-- disabled: turning it on with policies permissive enough to preserve every
-- existing SELECT/INSERT/UPDATE the app relies on would add real risk of
-- silently breaking a live flow, without the app ever using row-level
-- restrictions in practice (there's no per-user ownership model to enforce
-- yet). What RLS-off actually leaves exposed is worse than it needs to be
-- for one specific case: a leaked SUPABASE_ANON_KEY today could wipe every
-- table outright, not just read/tamper with it. Nothing in the app's own
-- code ever issues a DELETE against any of these tables (verified — the
-- only DELETE anywhere is inside reset_login_attempts below), so revoking
-- it from anon costs zero functionality and closes the single most
-- catastrophic action available to a leaked key.

revoke delete on
  assessments,
  findings,
  finding_impacts,
  recommendations,
  finding_citations,
  questions,
  daily_usage,
  ai_cache,
  optimization_metrics,
  admin_login_attempts
from anon;

-- reset_login_attempts is the one legitimate delete in the whole app (see
-- 0013) — redefined as SECURITY DEFINER so it still works from the anon
-- role's own privileges being revoked above. search_path is pinned
-- explicitly, standard practice for SECURITY DEFINER functions so they
-- can't be tricked by a caller-controlled search_path into resolving
-- "admin_login_attempts" to some other object.
create or replace function reset_login_attempts(p_ip text)
returns void as $$
begin
  delete from admin_login_attempts where ip = p_ip;
end;
$$ language plpgsql security definer set search_path = public;
