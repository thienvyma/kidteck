# AIgenlabs Agent Rules

<!-- BEGIN:nextjs-agent-rules -->
## This Is Not The Next.js You Know

This project uses modern Next.js App Router. APIs, conventions, and file structure may differ from older model memory. Before changing Next.js behavior, read the relevant local guide in `node_modules/next/dist/docs/` and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Required Reading Before Work

Before changing code, UI, product docs, database, or architecture, read:

1. `docs/kidtech-prd.md`
2. `docs/PROJECT_STYLE_GUIDE.md`
3. `docs/VIBE_CODING_RULES.md`
4. `docs/database-schema.md` if the task touches Supabase tables, RLS, auth, admin CRUD, leads, curriculum, payments, blog, or CMS content.
5. The closest phase README in `docs/phases/*` when the task touches an existing phase.

If the task touches rendered UI, also inspect `src/app/globals.css`, the relevant CSS module, and the closest current component/page pattern.

## Project North Star

AIgenlabs is an EdTech platform for students aged 12-17 learning AI, system thinking, operation mindset, and project-based technology skills.

The product has three first-class surfaces:

- Public landing and blog for parents and students to understand the brand, curriculum, proof, FAQ, and submit leads.
- Admin operations for students, levels, subjects, payments, leads, blog posts, and landing CMS.
- Student portal for enrolled learners to view courses, lessons, progress, profile, and portfolio.

The current app already has real Supabase-backed routes and APIs. Aistudio demo UI may be used as visual/product direction, but must not replace backend contracts with localStorage mocks.

## Non-Negotiable Product Rules

- Do not treat Landing as a static intro page. It must remain a CMS-backed sales and trust surface: hero, parent problem, positioning, roadmap, outcomes/projects, method, commitment/proof, FAQ, contact, CTA, and blog discovery when available.
- Do not build a free-form page builder in MVP. Use controlled landing sections and typed editor schema.
- Do not hardcode business data in render components: curriculum levels, prices, subjects, payment states, lead statuses, blog content, FAQ, CTA copy, SEO, navigation, contact links, or tracking IDs.
- Backend/Supabase is the source of truth for auth, roles, curriculum, enrollments, progress, payments, lead submissions, blog publishing, and landing CMS saves.
- Public lead forms must submit through `/api/landing-leads`; do not store parent/student PII in browser localStorage for production behavior.
- Admin-changing actions require server-side authorization. UI-only hiding is not security.
- Blog public routes must only expose published posts and must keep SEO/cover media behavior intact.
- Aistudio demo admin auth, appMode switching, localStorage versions/audit/logs, sample lead generation, and Tailwind-only styling are prototype behavior and must not be copied into the production app.

## UI And Brand Rules

Preserve the AIgenlabs brand direction:

- Bright, high-trust AI education feel: clean white/slate base, cyan/purple brand accents, clear information density, confident but parent-friendly tone.
- Use the real AIgenlabs logo assets in `public/AIGen_blacklogo.png` and `public/AIGen_whitelogo.png` through existing Next image patterns.
- Prefer polished operational UI over generic SaaS decoration: dashboards should be scannable, forms clear, status visible, and repeated workflows efficient.
- Landing copy should speak to parents and learners: AI literacy, project output, system thinking, operation mindset, mentor feedback, and safe progression for ages 12-17.
- Avoid cold generic template copy, fake analytics claims, stock-like claims without source data, neon overload, or visuals that imply capabilities not built.
- Keep Vietnamese UI text readable and UTF-8. PowerShell may display mojibake, but source files should remain valid UTF-8.

## Architecture Rules

- Keep `src/app/page.js` thin: it fetches landing data and renders the landing view.
- Keep backend/data access in `src/lib/*` or API routes, not inside JSX branches.
- Keep reusable UI in `src/components/*`; landing-specific UI in `src/components/landing/*`; admin-specific UI in `src/components/admin/*`.
- Large pages must be decomposed when edited. Files above roughly 300-400 lines should not grow further unless there is a documented reason.
- For Landing CMS, keep the contract aligned across:
  - `src/lib/landing-defaults.js`
  - `src/lib/landing-content.js`
  - `src/lib/landing-editor-schema.js`
  - `src/components/landing/LandingPageView.js`
  - `src/app/admin/landing/page.js`
- Preserve preview contract for `/admin/landing`: section IDs, `data-landing-preview-section`, iframe preview, draft `postMessage`, dirty state, and `expectedUpdatedAt` conflict handling.
- Prefer Server Components for read-heavy pages. Use `"use client"` only for state, effects, form interactivity, browser APIs, or client Supabase sessions.
- Use CSS Modules and `globals.css` tokens. Do not introduce Tailwind or copy Tailwind classes from the Aistudio demo into this app.

## Backend, Security, And Data Rules

- Read `docs/database-schema.md` before writing Supabase queries.
- Every Supabase call must handle `{ data, error }`.
- Admin APIs must verify the user and `profiles.role`.
- Service-role Supabase clients are server-only. Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components.
- Input validation belongs on both client and server. Client validation improves UX; server validation protects data.
- Important statuses must be explicit strings/enums, not vague booleans, for leads, payments, enrollments, blog posts, and CMS publish states.
- Sensitive data such as lead phone/email, student records, payment records, and admin notes must not be exposed on public routes.
- Public tracking settings must store safe IDs/config only. Do not paste raw third-party scripts into components or CMS content.

## Workflow Rules

- Use Superpowers skills when applicable.
- For new behavior, UI replacement, or multi-module work, brainstorm/design before implementation.
- For debugging, reproduce and identify root cause before changing code.
- For large changes, write a focused design/spec and implementation plan before editing production code.
- Keep docs current truth first. Replace stale guidance instead of leaving confusing "old/deprecated/TODO" alternatives.
- Do not revert user changes. Work with dirty worktrees carefully.
- Before claiming completion, run verification that proves the claim.

## Verification Defaults

- Documentation/rule changes: search for contradictory stale references and check `git diff`.
- JavaScript/CSS/API changes: run `npm run lint`.
- Build-impacting frontend changes: run `npm run build`.
- Landing UI changes: inspect `/`, `/landing-preview`, and `/admin/landing` when feasible.
- Lead form changes: verify `/api/landing-leads` and `/admin/leads`.
- Blog changes: verify `/blog`, `/blog/[slug]`, and `/admin/blogs`.
- Auth/admin changes: verify admin-only APIs reject non-admin access.

## Current Repo Notes

- The production app lives in `D:\Kidtech\kidtech-app`.
- The Aistudio UI reference lives in `D:\Kidtech\aigenlabs-landing-cms-&-admin-panel` and is not a git repo.
- The Aistudio demo is useful for visual direction and admin CMS feel, but uses Vite, Tailwind, localStorage, and mock routing.
- Current production stack is Next.js, React, JavaScript, CSS Modules, Supabase, and Vercel-oriented deployment.
- Public landing currently renders through `src/components/landing/LandingPageView.js`.
- Landing CMS content is normalized through `src/lib/landing-content.js` and saved through `/api/admin/landing-content`.
- Public leads are created through `/api/landing-leads`; admin leads live under `/admin/leads`.
- Blog public/admin routes already exist and should stay separate from Landing CMS.
