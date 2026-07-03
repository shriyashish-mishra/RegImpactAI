# Supabase migrations

Apply in numeric order via the Supabase SQL Editor:

```
0001_create_assessments.sql
0002_create_findings.sql
0003_create_finding_impacts.sql
0004_create_recommendations_and_citations.sql
0005_create_questions.sql
0006_add_verified_to_finding_citations.sql
0007_disable_rls.sql
```

These tables are everything the vertical slice (Synthesize → Discovery →
Generate → Persist → Report) reads and writes. There is no `corpus_clauses`
table — the regulatory corpus lives in code (`lib/corpus.ts`), not in
Postgres, so nothing needs seeding there.

`questions` (0005) persists discovery Q&A server-side as it's answered, so a
mid-flow refresh doesn't silently drop an answer. It does not add full
wizard-state resume — the confirmed product model (elements, triggered
areas) still lives only in client state, so refreshing still restarts the
wizard at Step 1; it just no longer loses previously-answered questions from
the database's point of view.

`finding_citations.verified` (0006) marks whether a citation's underlying
corpus clause was transcribed from a verified source (all DLG clauses) or
reconstructed from general knowledge and not yet checked against the current
regulation (all KYC_AML clauses today — see the header comment in
`lib/corpus.ts`). The value is resolved server-side from the corpus, not
trusted from the model's output, and the UI must show an "unverified" notice
wherever `verified: false` — see `components/primitives/CitationBlock.tsx`.

RLS (0007) is explicitly disabled — newly created Supabase projects enable
it by default on every table, but this app's anon-key-does-everything
design predates that default and has no RLS policies defined. If a fresh
project reports `42501: row-level security policy` errors on insert, this
migration is why it's needed.

Schema matches `lib/types.ts` exactly as it exists in this repo today:
`findings` has no `run_id` column, and `recommendations` has no `status`
column. Both are real gaps relative to later milestones' designs, not bugs —
they're deferred until a milestone that actually needs re-assessment
versioning or recommendation status tracking.
