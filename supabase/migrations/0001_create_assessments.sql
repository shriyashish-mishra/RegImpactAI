-- Milestone 1 (vertical slice): assessments table
-- Matches lib/types.ts AssessmentRow exactly: id, product_name, description, created_at.

create table if not exists assessments (
  id           uuid        primary key default gen_random_uuid(),
  product_name text        not null,
  description  text        not null,
  created_at   timestamptz not null default now()
);
