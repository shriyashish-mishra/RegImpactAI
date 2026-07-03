-- Adds explainability fields to findings so every clause tested can be
-- classified (not just gaps reported), and so confidence/evidence reasoning
-- is stored rather than only a bare confidence label.
--
-- Existing rows default to classification 'potential_gap' — every row
-- written before this migration was, by definition, a gap (the model only
-- ever produced findings for non-compliant clauses at that time), so this
-- preserves their correct meaning rather than mislabeling old data as
-- 'compliant' or 'info_required'.

alter table findings
  add column if not exists classification text not null default 'potential_gap'
    check (classification in ('compliant', 'non_compliant', 'potential_gap', 'info_required')),
  add column if not exists confidence_reasoning text not null default '',
  add column if not exists evidence_found text[] not null default '{}',
  add column if not exists evidence_missing text[] not null default '{}',
  add column if not exists inference_made text not null default '';
