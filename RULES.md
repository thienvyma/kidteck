# AIgenlabs Rules

This file is a short project rule entry. `AGENTS.md`, `docs/PROJECT_STYLE_GUIDE.md`, and `docs/VIBE_CODING_RULES.md` are the current detailed rules.

## Read First

Before changing code, docs, UI, database, or architecture, read:

1. `AGENTS.md`
2. `docs/kidtech-prd.md`
3. `docs/PROJECT_STYLE_GUIDE.md`
4. `docs/VIBE_CODING_RULES.md`
5. `docs/database-schema.md` when touching Supabase, auth, RLS, CRUD, leads, payments, curriculum, blog, or CMS.
6. The relevant source files and phase README.

## Current Product Truth

AIgenlabs is a Next.js and Supabase EdTech platform for students aged 12-17. It has public landing/blog, admin operations, and student portal surfaces.

The Aistudio project in `D:\Kidtech\aigenlabs-landing-cms-&-admin-panel` is a UI reference only. It uses Vite, Tailwind, localStorage, mock routing, and mock admin flows. Do not copy that architecture into production.

The Tà Giang project is a rule and architecture reference only. Copy its discipline, not its retreat/farm/membership domain.

## Non-Negotiable Rules

- Keep backend/Supabase as source of truth.
- Do not store production leads, CMS state, blog posts, levels, versions, or audit logs in localStorage.
- Do not hardcode business data in components.
- Do not introduce Tailwind into `kidtech-app`; use CSS Modules and `src/app/globals.css`.
- Keep route shells thin and feature components focused.
- Keep Landing CMS contract aligned across defaults, normalization, editor schema, public renderer, and admin editor.
- Admin operations must verify role server-side.
- Public lead forms submit through `/api/landing-leads`.
- Blog public pages only expose published posts.
- Do not revert user changes or unrelated work.

## Workflow

- New behavior/UI replacement: design first, then plan, then implement.
- Bugs: reproduce or identify root cause before fixing.
- Multi-module work: write a focused plan before code.
- Keep docs current truth first; replace stale guidance instead of preserving confusing alternatives.
- Before claiming completion, run fresh verification.

## Verification Defaults

- Docs-only: inspect `git diff` and search for stale contradictory references.
- JS/CSS/API: `npm run lint`.
- Build-impacting changes: `npm run build`.
- Landing UI: browser-check `/`, `/landing-preview`, and `/admin/landing` when feasible.
- Leads: verify `/api/landing-leads` and `/admin/leads`.
- Blog: verify `/blog`, `/blog/[slug]`, and `/admin/blogs`.

## Current High-Priority Direction

1. Consolidate rules/docs around the current app.
2. Audit the current code and verify build/lint/tests.
3. Fix real bugs with root-cause evidence.
4. Port selected Aistudio UI direction into the current Next/Supabase contracts, not the other way around.
