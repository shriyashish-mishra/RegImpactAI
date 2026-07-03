-- Newly created Supabase projects enable Row Level Security by default on
-- every table. This app was designed without RLS — the anon key is trusted
-- to read/write directly (see supabase/migrations/README.md) — so disable
-- it explicitly rather than relying on a per-project default that changed
-- after this schema was originally written.

alter table assessments        disable row level security;
alter table findings            disable row level security;
alter table finding_impacts      disable row level security;
alter table recommendations      disable row level security;
alter table finding_citations    disable row level security;
alter table questions            disable row level security;
