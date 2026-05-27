# AIgenlabs AI Memory

Read `AGENTS.md` first. This file exists for tools that still look for a Claude-style project memory file.

## Project

AIgenlabs is an EdTech platform for students aged 12-17 learning AI, system thinking, operation mindset, and project-based technology skills.

## Current Stack

- Next.js App Router with React 19.
- JavaScript ES modules.
- CSS Modules and `src/app/globals.css`.
- Supabase Auth/Postgres/RLS.
- Admin, student, landing, blog, and API routes in one app.

## Current Source Of Truth

Required rules and docs:

1. `AGENTS.md`
2. `docs/kidtech-prd.md`
3. `docs/PROJECT_STYLE_GUIDE.md`
4. `docs/VIBE_CODING_RULES.md`
5. `docs/database-schema.md` for Supabase work
6. `docs/INDEX.md`

## Important Current Routes

- `/`: public landing, rendered by `src/components/landing/LandingPageView.js`.
- `/landing-preview`: landing preview route used by admin CMS.
- `/admin/landing`: landing CMS editor.
- `/admin/leads`: lead operations.
- `/admin/blogs`: blog admin.
- `/blog` and `/blog/[slug]`: public blog.
- `/student/*`: student portal.
- `/admin/*`: admin operations.

## Current Rule Reminder

The Aistudio demo folder is a UI reference only. Keep production data/auth/API/CMS in the current Next/Supabase app.

Do not copy demo localStorage persistence, Vite app shell, Tailwind classes, mock admin switching, mock versions, or mock audit logs into production.

Use `npm run lint`, `npm run build`, and focused tests/browser checks before claiming completion.
