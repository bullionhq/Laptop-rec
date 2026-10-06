# Laptop Recommendation Engine

A Next.js + Supabase application that recommends laptops based on **use-case fit**, not price.  
It finds the simplest/oldest machines that still fully meet the user’s needs and returns three tiers: **Minimum**, **Balanced**, and **Future-proof**.

## Current Status

**Phase 2 Complete** — End-to-end questionnaire → results flow works on top of the Phase 1 data layer and scoring engine. Questionnaire is v1 (6 steps: use cases → screen → portability → OS → performance → summary).

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ Done | Project scaffolding, modern Supabase keys, folder structure |
| Phase 1 | ✅ Done | Schema, seed, types, scoring engine, Server Action, offline fallback |
| Phase 2 | ✅ Done | Questionnaire UI (v1), three-tier results page, Start over flow, loading + error states, mobile layout, local JSON fallback |
| Phase 3+ | Planned | Auth, live product data, conversational layer |

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`)
- **Zod** for validation

## Supabase Keys (Modern)

This project uses the **new publishable + secret keys** (not the legacy `anon` / `service_role` JWTs):

| Environment Variable | Key Type | Notes |
|----------------------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Safe to expose |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`) | Safe to expose, respects RLS |
| `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_...`) | **Server-only** — never prefix with `NEXT_PUBLIC_` |

Copy `.env.example` → `.env.local` and fill in your real values.

## Getting Started

```bash
npm install
cp .env.example .env.local   # then edit with your Supabase keys
npm run dev