-- Milestone 1 (vertical slice): findings table
-- Matches lib/types.ts FindingRow exactly. No run_id column — this repo's
-- current schema predates that field; findings are keyed to assessment_id only.

create table if not exists findings (
  id                   uuid        primary key default gen_random_uuid(),
  assessment_id        uuid        not null references assessments(id) on delete cascade,
  area_code            text        not null,
  area_name            text        not null,
  title                text        not null,
  what_found           text        not null,
  why_matters          text        not null,
  severity             text        not null check (severity in ('high','medium','low')),
  confidence           text        not null check (confidence in ('high','moderate','low')),
  driver_clarity       text        not null check (driver_clarity in ('high','moderate','low')),
  driver_understanding text        not null check (driver_understanding in ('high','moderate','low')),
  created_at           timestamptz not null default now()
);

create index if not exists idx_findings_assessment_id on findings(assessment_id);
