# docs/INDEX.md - AIgenlabs Documentation Map

## Required Current Rules

| File | Role | Read When |
|---|---|---|
| `AGENTS.md` | Concise agent rules and current repo notes | Before any code, docs, UI, or architecture change |
| `docs/kidtech-prd.md` | AIgenlabs PRD and product source of truth | Product context, scope, audience, feature intent |
| `docs/PROJECT_STYLE_GUIDE.md` | Brand, UI, and module style guide | UI/UX, landing, admin, frontend structure |
| `docs/VIBE_CODING_RULES.md` | Project-specific coding and workflow rules | Code, docs, debugging, architecture work |
| `docs/database-schema.md` | Supabase schema, RLS, seed data | Auth, CRUD, admin APIs, leads, curriculum, payments |
| `docs/VIBECODING_GUIDE.md` | General methodology reference | Workflow and Superpowers-style process |

## Phase READMEs

| Session | Phase Directory | Module |
|---|---|---|
| S3 | `docs/phases/phase-03-auth-core/` | Auth Core & Middleware |
| S4 | `docs/phases/phase-04-auth-ui/` | Auth UI |
| S5 | `docs/phases/phase-05-admin-layout/` | Admin Layout + Components |
| S6 | `docs/phases/phase-06-admin-dashboard/` | DataTable + Dashboard |
| S7 | `docs/phases/phase-07-admin-students/` | Students CRUD |
| S8 | `docs/phases/phase-08-admin-courses/` | Courses & Payments |
| S9 | `docs/phases/phase-09-student-layout/` | Student Layout + Components |
| S10 | `docs/phases/phase-10-student-dashboard/` | Dashboard + Course List |
| S11 | `docs/phases/phase-11-student-learning/` | Learning Flow + Profile |
| S13 | `docs/phases/phase-13-security-hardening/` | Security Hardening |
| S14 | `docs/phases/phase-14-admin-crud/` | Admin CRUD Completion |
| S15 | `docs/phases/phase-15-ux-polish/` | UX Polish |
| S16 | `docs/phases/phase-16-admin-landing-cms/` | Admin Landing CMS + Preview |

## Root Docs

| File | Role |
|---|---|
| `RULES.md` | Legacy workflow rules. Use with `AGENTS.md`; update when stale. |
| `SESSIONS.md` | Session plan history. |
| `PROGRESS.md` | Progress history. May lag current repo; verify with code. |
| `architecture_state.json` | Machine-readable module status. May lag current repo; verify with code. |
| `CLAUDE.md` | Legacy AI memory entry point. May lag current repo; prefer `AGENTS.md`. |
| `ARCHITECTURE.md` | Architecture overview. May need cleanup after current audit. |
| `DECISIONS.md` | Design decisions history. |

## Current External Reference

| Path | Role |
|---|---|
| `D:\Kidtech\aigenlabs-landing-cms-&-admin-panel` | Aistudio UI reference only. Do not copy its localStorage/Vite/Tailwind mock architecture into production. |
| `D:\tà-giang-ecolodge-membership` | Architecture/rule reference only. Copy workflow discipline, not retreat/farm domain behavior. |
