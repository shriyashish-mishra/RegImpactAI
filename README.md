# RegImpact AI

AI-powered regulatory impact assessment for Indian fintech products.

RegImpact AI analyzes a fintech product, identifies applicable RBI regulations, asks only the clarifying questions that materially affect compliance, and generates a consultant-style compliance report with verified regulatory citations.

## Live Demo

* **Live Demo:** https://YOUR-VERCEL-URL.vercel.app/demo/sample — zero-setup, no API keys needed
* **Case Study:** https://YOUR-VERCEL-URL.vercel.app/case-study
* **Architecture:** https://YOUR-VERCEL-URL.vercel.app/architecture

## Why I Built This

Most AI compliance demos can generate findings, but they rarely prove that their citations are correct.

This project focuses on trust. Every compliance finding is backed by verified regulatory references before being presented.

## Features

* AI-powered regulatory assessment
* Dynamic clarification questions
* Citation-backed compliance findings
* Consultant-style report generation
* Interactive architecture walkthrough
* End-to-end product case study
* Zero-setup sample demo

## Tech Stack

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* Supabase
* Anthropic Claude API
* Vercel

## AI Workflow

1. Parse product description
2. Infer product characteristics
3. Generate clarification questions
4. Evaluate applicable regulations
5. Verify citations
6. Generate final compliance report

## Project Structure

```text
app/
components/
lib/
public/
styles/
```

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env.local` file containing:

```text
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_GITHUB_URL=
```

## Future Improvements

* Multi-regulation support
* Authentication
* Report history
* PDF export
* Team collaboration
* More regulatory domains

## Author

Shriyashish Mishra

Product Manager

Built as a portfolio project demonstrating AI Product Management, prompt engineering, and full-stack product development.
