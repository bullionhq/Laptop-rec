# Laptop Recommendation Engine

## Phase 0

This is **Phase 0** of the Laptop Recommendation Engine.

Project scaffolding is complete and ready for development.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`)
- **Zod** for schema validation

## Supabase Keys

This project uses the **modern Supabase publishable + secret keys** (not the old ANON_KEY / SERVICE_ROLE_KEY naming):

| Environment Variable | Key Type | Prefix | Notes |
|----------------------|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | `NEXT_PUBLIC_` | Safe to expose client-side |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (replaces `ANON_KEY`) | `NEXT_PUBLIC_` | Safe to expose client-side, respects RLS |
| `SUPABASE_SECRET_KEY` | Secret key (replaces `SERVICE_ROLE_KEY`) | **No `NEXT_PUBLIC_` prefix** | Never expose client-side, bypasses RLS |

Copy `.env.example` to `.env.local` and fill in your actual values before running.

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Next Step

**Phase 1** — Database schema + scoring engine.
# Laptop-rec
# Laptop-rec
