# Supabase migrations

Apply in numeric order via the Supabase SQL Editor:

```
0001_create_assessments.sql
0002_create_findings.sql
0003_create_finding_impacts.sql
0004_create_recommendations_and_citations.sql
```

These four tables are everything Milestone 1's vertical slice (Synthesize →
Discovery → Generate → Persist → Report) reads and writes. There is no
`corpus_clauses` table — the regulatory corpus lives in code (`lib/corpus.ts`),
not in Postgres, so nothing needs seeding there.

Schema matches `lib/types.ts` exactly as it exists in this repo today:
`findings` has no `run_id` column, and `recommendations` has no `status`
column. Both are real gaps relative to later milestones' designs, not bugs —
they're deferred until a milestone that actually needs re-assessment
versioning or recommendation status tracking.
