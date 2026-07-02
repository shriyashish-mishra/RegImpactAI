-- Discovery questions and answers, persisted server-side so a mid-flow
-- refresh doesn't silently lose an in-progress discovery answer.
-- Note: this persists the Q&A itself; it does not add wizard-state resume
-- (the client-side step/model still lives only in React state) — that would
-- also require persisting the confirmed product model (elements,
-- triggered_areas), which this migration deliberately does not add.

create table if not exists questions (
  id            uuid        primary key default gen_random_uuid(),
  assessment_id uuid        not null references assessments(id) on delete cascade,
  seq           int         not null,
  prompt        text        not null,
  rationale     text        not null,
  answer        text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_questions_assessment_id on questions(assessment_id);
