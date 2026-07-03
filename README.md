# RegImpact AI

AI-powered regulatory impact assessment for Indian fintech products.

RegImpact AI analyzes a fintech product, identifies applicable RBI regulations, asks only the clarifying questions that materially affect compliance, and generates a consultant-style compliance report with verified regulatory citations.

## Live Demo

* **Live Demo:** https://reg-impact-ai.vercel.app/demo/sample — zero-setup, no API keys needed
* **Case Study:** https://reg-impact-ai.vercel.app/case-study
* **Architecture:** https://reg-impact-ai.vercel.app/architecture

## Why I Built This

Most AI compliance demos can generate findings, but they rarely prove that their citations are correct.

This project focuses on trust. Every compliance finding is backed by verified regulatory references before being presented.

## Features

* AI-powered regulatory assessment across two regulatory areas (DLG, KYC/AML) — every applicable clause is classified as compliant, non-compliant, a potential gap, or requiring more information, not just flagged when there's a problem
* Dynamic clarification questions
* Citation-backed compliance findings, with unverified citations explicitly flagged
* Executive summary with compliance score, overall risk, launch recommendation, and estimated remediation effort
* Evidence-to-citation traceability on every finding, with a built-in hallucination guard that flags high-confidence claims citing no supporting evidence
* Consultant-style report generation, streamed live as findings are produced
* Owner report history (password-gated, at `/admin`)
* PDF export (browser print, on every report)
* Interactive architecture walkthrough
* End-to-end product case study
* Zero-setup sample demo

## Tech Stack

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* Supabase
* Google Gemini API
* Vercel

## AI Workflow

1. Parse product description
2. Infer product characteristics
3. Generate clarification questions
4. Classify every applicable clause as compliant, non-compliant, a potential gap, or requiring more information
5. Verify citations
6. Compute the executive summary — compliance score, overall risk, launch recommendation
7. Generate final compliance report

## Project Structure

```text
app/          routes, layouts, API handlers
components/   screens, shell, and shared UI primitives
lib/          prompts, Supabase clients, corpus, shared types
public/       static assets
supabase/     SQL migrations
```

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env.local` file containing:

```text
GOOGLE_GENERATIVE_AI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Required only for /admin (report history) — pick your own value
ADMIN_PASSWORD=

# Optional — both default to the real production values if unset
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_GITHUB_URL=
```

`SUPABASE_URL`/`SUPABASE_ANON_KEY` have no `NEXT_PUBLIC_` prefix — this app
only talks to Supabase from the server, so the browser-exposure prefix
isn't needed. These are also exactly the names Vercel's Supabase
integration provisions automatically if you connect a project via the
Vercel dashboard instead of setting them by hand.

Then apply the SQL migrations in `supabase/migrations/` (in order) via the Supabase SQL Editor —
see `supabase/migrations/README.md`.

## Future Improvements

* Verify the KYC/AML corpus clauses against RBI's current source text (currently flagged unverified — see `/architecture`)
* More regulatory domains
* Full multi-user authentication (current `/admin` is a single-owner password gate, not per-user accounts)
* Team collaboration

## Author

Shriyashish Mishra

Product Manager

Built as a portfolio project demonstrating AI Product Management, prompt engineering, and full-stack product development.
