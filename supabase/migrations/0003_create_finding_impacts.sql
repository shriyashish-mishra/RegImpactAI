-- Milestone 1 (vertical slice): finding_impacts table
-- Matches lib/types.ts FindingImpactRow exactly.

create table if not exists finding_impacts (
  id          uuid primary key default gen_random_uuid(),
  finding_id  uuid not null references findings(id) on delete cascade,
  lens        text not null check (lens in ('product','ui','engineering','business')),
  description text not null
);

create index if not exists idx_finding_impacts_finding_id on finding_impacts(finding_id);
