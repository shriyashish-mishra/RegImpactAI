-- Rate limiting for /api/admin/login. The password check itself uses a
-- timing-safe comparison (see lib/adminSession.ts), which prevents timing
-- attacks on a single guess — but nothing previously stopped unlimited
-- guesses over the network. One row per client IP, a fixed window that
-- resets itself the same way daily_usage does (no cron job needed).

create table if not exists admin_login_attempts (
  ip                text primary key,
  attempt_count     int         not null default 0,
  window_started_at timestamptz not null default now()
);

-- Atomically checks the limit and increments in one statement — same
-- concurrency-safety reasoning as increment_daily_usage. The window resets
-- (back to a fresh count of 1) once p_window_seconds has elapsed since it
-- started, rather than blocking that IP forever after one burst.
create or replace function check_and_increment_login_attempt(
  p_ip text,
  p_max_attempts int,
  p_window_seconds int
)
returns table (allowed boolean, attempts int) as $$
declare
  v_window_started_at timestamptz;
  v_new_count int;
begin
  insert into admin_login_attempts (ip, attempt_count, window_started_at)
  values (p_ip, 0, now())
  on conflict (ip) do nothing;

  select window_started_at into v_window_started_at
  from admin_login_attempts where ip = p_ip;

  if v_window_started_at < now() - make_interval(secs => p_window_seconds) then
    update admin_login_attempts
    set attempt_count = 1, window_started_at = now()
    where ip = p_ip
    returning attempt_count into v_new_count;
    return query select true, v_new_count;
  end if;

  update admin_login_attempts
  set attempt_count = attempt_count + 1
  where ip = p_ip and attempt_count < p_max_attempts
  returning attempt_count into v_new_count;

  if v_new_count is null then
    select attempt_count into v_new_count from admin_login_attempts where ip = p_ip;
    return query select false, v_new_count;
  else
    return query select true, v_new_count;
  end if;
end;
$$ language plpgsql;

-- Resets an IP's counter on successful login, so a legitimate owner who
-- mistypes a few times isn't left sitting near the limit afterward.
create or replace function reset_login_attempts(p_ip text)
returns void as $$
begin
  delete from admin_login_attempts where ip = p_ip;
end;
$$ language plpgsql;

alter table admin_login_attempts disable row level security;
