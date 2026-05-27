# AIgenlabs Vibe Coding Rules

This file contains project-specific development rules. It adapts the working discipline from the Tà Giang Ecolodge membership project to AIgenlabs.

## 1. Read Context Before Code

Before changing code or docs, read the current source of truth:

- `AGENTS.md`
- `docs/kidtech-prd.md`
- `docs/PROJECT_STYLE_GUIDE.md`
- This file
- The closest source files and phase README

If the task touches Supabase or security, read `docs/database-schema.md` before writing queries.

If the task touches UI, read `src/app/globals.css` and the relevant CSS module before adding styles.

## 2. Current Product Truth

AIgenlabs is a real EdTech platform, not only a landing-page prototype.

The app must support:

- Public landing and blog.
- Parent/student consultation lead capture.
- Admin operations.
- Student portal.
- Curriculum levels and subjects.
- Enrollments, progress, and payments.
- Landing CMS with preview and save workflow.

Aistudio demo UI is a design reference. It is not the production architecture.

## 3. Do Not Hardcode Business Data

Do not hardcode these in components:

- Curriculum levels, prices, durations, subject counts, or subject lists.
- Lead statuses, lead notes, or parent/student PII.
- Payment statuses or amounts.
- Blog content, publish states, SEO fields, or cover media.
- Landing content, FAQ, CTA, footer, contact links, and tracking IDs.

Use Supabase, API routes, or normalized CMS defaults/repositories.

## 4. Backend Is The Source Of Truth

Frontend must not decide:

- Whether a user is admin or student.
- Whether a payment is paid/refunded.
- Whether a learner is enrolled.
- Whether a subject is completed.
- Whether a blog post is public.
- Whether a lead status update is valid.
- Whether landing CMS content is saved.

Frontend sends requests and renders backend state.

## 5. Keep Mock Behavior Out Of Production

Do not copy the following from the Aistudio demo into `kidtech-app`:

- `localStorage` persistence for production CMS, leads, blogs, levels, versions, audit logs.
- Client-only admin login via `appMode`.
- Mock lead generator.
- Mock dashboard metrics shown as real.
- Tailwind utility classes.
- Vite app shell.
- Text-only logo replacing real brand assets.

If a mock is needed for development, name it clearly as seed/fallback data and keep it out of production user flows.

## 6. Module Boundaries

Keep responsibilities clear:

- `src/app/*`: route shells, metadata, server data loading, layouts.
- `src/components/landing/*`: public landing renderer and landing-only visual components.
- `src/components/admin/*`: admin shell, tables, editor components, admin UI.
- `src/components/ui/*`: reusable UI primitives.
- `src/lib/*`: Supabase clients, repositories, normalization, validation, business helpers.
- `src/app/api/*`: API route authorization, validation, server-side mutations.

Do not put repository logic or long business rules inside JSX.

## 7. Landing CMS Rules

Landing CMS is controlled-section editing, not a free-form page builder.

Any landing schema change must update the full chain:

- Defaults in `src/lib/landing-defaults.js`.
- Normalization in `src/lib/landing-content.js`.
- Editor schema in `src/lib/landing-editor-schema.js`.
- Public rendering in `src/components/landing/LandingPageView.js`.
- Admin editor/preview behavior in `src/app/admin/landing/page.js` if needed.

Rules:

- Keep stable section IDs for preview and anchors.
- Public renderer should filter empty repeated items safely.
- Admin should not require raw JSON editing.
- Save should keep optimistic conflict protection with `expectedUpdatedAt`.
- Preview must not publish changes.

## 8. Blog And SEO Rules

Blog exists for organic education and free traffic.

Public blog pages must:

- Only show published posts.
- Keep stable slugs.
- Use cover image handling that avoids layout shift.
- Sanitize/render rich content safely.
- Preserve title/excerpt/meta behavior.

Admin blog must keep publish/archive controls separate from landing CMS.

## 9. Lead Rules

Public lead capture must:

- Validate name, phone, email, age/stage, message length, and honeypot on the server.
- Write to backend through `/api/landing-leads`.
- Avoid storing PII in localStorage.
- Return friendly errors without exposing internals.

Admin lead management must:

- Verify admin role server-side.
- Use explicit statuses.
- Persist notes/status updates.
- Keep filters and pagination usable for operations.

## 10. Admin Operations Rules

Admin pages must:

- Verify authorization in server route/page/API.
- Display loading, empty, error, and success states.
- Use confirmation for destructive or risky actions.
- Keep data tables searchable/sortable where useful.
- Avoid fake metrics unless clearly labeled as unavailable.

For future audit/version features:

- Only show audit/version history as real if it comes from backend tables/events.
- Do not present local snapshots as production rollback.

## 11. Security Rules

- Never expose service-role key to client code.
- Never rely on hidden UI for authorization.
- Do not return stack traces or SQL details to clients.
- Validate all API input server-side.
- Read RLS policies before changing profile, payment, lead, or admin behavior.
- Treat parent/student phone, email, profile, payment, and progress records as private data.

## 12. Next.js Rules

- Server Components are default.
- Use `"use client"` only for browser interactivity.
- Use Next `<Link>` for internal navigation.
- Use Next `<Image>` for optimized images when practical.
- Read local Next docs under `node_modules/next/dist/docs/` before changing framework behavior.
- Do not copy Vite patterns into the Next app.

## 13. CSS Rules

- Use CSS Modules and `globals.css` variables.
- Do not introduce Tailwind.
- Do not add a CSS library for one-off styling.
- Keep styles responsive and test mobile widths.
- Avoid one-note palette drift. AIgenlabs should stay white/slate with cyan/purple accents, not all-purple gradients.

## 14. File Size And Refactor Rules

- If a file is already large, do not make it much larger during a feature change.
- Split natural sections into focused components when editing heavy landing/admin files.
- Prefer small helpers over repeated JSX logic.
- Do not create broad barrel exports that hide dependencies.

## 15. Debugging Rules

When fixing a bug:

1. Reproduce or locate the failure.
2. Read the relevant error/output fully.
3. Trace root cause.
4. Compare with working patterns.
5. Make the smallest fix.
6. Run verification.

Do not guess-fix several unrelated issues in one patch.

## 16. Verification Rules

Before saying work is complete:

- Run `npm run lint` for JS/CSS/API changes.
- Run `npm run build` for frontend/build changes.
- Run focused Node tests when touching tested modules.
- Browser-check public/admin UI when feasible.
- Report any command you could not run and why.

## 17. Current High-Priority Consolidation Direction

The next consolidation should prefer:

1. Preserve production backend/API/Auth.
2. Port useful Aistudio public landing visual direction into current renderer.
3. Translate demo styling into CSS Modules.
4. Extend landing CMS schema only when needed.
5. Strengthen real draft/publish/audit/versioning only as a backend-backed slice, not localStorage.
6. Keep blog, leads, levels, and admin operations connected to existing Supabase flows.
