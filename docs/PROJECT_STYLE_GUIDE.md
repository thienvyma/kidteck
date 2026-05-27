# AIgenlabs Project Style Guide

This guide is the current source of truth for AIgenlabs product style, frontend structure, and UI direction. It adapts the stronger rule system from the Tà Giang Ecolodge project to this EdTech platform.

## 1. Product Shape

AIgenlabs teaches AI, system thinking, operation mindset, and project-based technology skills to students aged 12-17.

Primary users:

- Public visitors: parents and students reading the landing page, blog, FAQ, and submitting consultation leads.
- Admins: operators managing students, curriculum levels, subjects, payments, leads, blog posts, and landing content.
- Students: authenticated learners viewing courses, lessons, progress, profile, and portfolio.

The product must feel like a credible AI project studio for young learners, not a generic coding bootcamp and not a decorative mockup.

## 2. Stack And Structure

Current stack:

- Next.js App Router with React 19.
- JavaScript ES modules, not TypeScript in the production app.
- CSS Modules plus `src/app/globals.css`, not Tailwind.
- Supabase Auth, PostgreSQL, RLS, and server/API helpers.
- Next image/font/metadata patterns where appropriate.

Current important surfaces:

- `src/app/page.js`: public home route shell.
- `src/components/landing/LandingPageView.js`: public landing renderer and preview renderer.
- `src/app/admin/landing/page.js`: landing CMS editor and live preview.
- `src/lib/landing-content.js`: landing CMS repository, normalization, save, fallback.
- `src/lib/landing-defaults.js`: CMS defaults.
- `src/lib/landing-editor-schema.js`: admin editor schema.
- `src/lib/landing-leads.js`: lead repository and fallback logic.
- `src/app/api/landing-leads/route.js`: public lead submission API.
- `src/app/api/admin/*`: admin operations APIs.

When adding or replacing UI, keep route shells thin and place feature UI in focused components.

## 3. Brand Language

AIgenlabs should read as:

- Intelligent, practical, modern.
- Parent-safe and student-inspiring.
- Studio/project-based rather than cram-school.
- AI-native but grounded in learning outcomes.
- Clear about real capabilities, never inflated.

Core messaging themes:

- AI literacy.
- System thinking.
- Operation mindset.
- Product/project mindset.
- Mentor feedback.
- Portfolio and project output.
- Safe progression by age group.

Avoid:

- Fake dashboards or metrics presented as real.
- Claims about analytics, conversion, ranking, certificates, or outcomes without backend/source support.
- Overly cold enterprise SaaS tone.
- Toy-like gamification for serious parent-facing pages.
- Copy that suggests localStorage/mock data is production behavior.

## 4. Visual Language

Use the current AIgenlabs design tokens in `src/app/globals.css`:

- Purple brand: `--color-primary`, `--color-primary-dark`, `--color-primary-light`.
- Cyan accent: `--color-secondary`, `--color-secondary-dark`.
- Slate/dark neutral text: `--color-dark`, `--color-gray-*`.
- White/light backgrounds: `--color-white`, `--color-light`.
- Semantic colors: success, warning, error, info.

Recommended visual feel:

- White/slate base with cyan/purple accents.
- Smooth cards, but not excessive nested cards.
- Clear CTA hierarchy.
- Dense admin tables and forms where operators need scanning.
- Good mobile behavior for parent visitors and admin quick checks.
- Real logo assets through `BrandLogo`, not text-only logo replacements unless explicitly requested.

Avoid copying Tailwind classes from the Aistudio demo. Translate the visual idea into CSS Modules and existing variables.

## 5. Landing UI Rules

Landing is a CMS-backed public sales and trust page. It should preserve these controlled sections:

- Header/navigation.
- Hero.
- Parent problem or market context.
- Positioning/solution.
- Roadmap/catalog from real `levels` and `subjects`.
- Outcomes/projects/proof.
- Method/studio learning model.
- Commitment/trust.
- Direct contact.
- FAQ.
- Lead CTA.
- Footer.

Rules:

- Roadmap curriculum data comes from Supabase `levels` and `subjects`, not landing JSON or Aistudio fixtures.
- Lead forms submit to `/api/landing-leads`.
- Blog discovery must use the real blog source if added to landing.
- Landing preview must use the same renderer as public landing.
- Enabled public sections must render useful content or be blocked/filtered by normalization/validation.

## 6. Admin UI Rules

Admin is for real operations, not a decorative demo.

Admin UI should provide:

- Clear page title and status.
- Search/filter/table for lists.
- Explicit statuses and badges.
- Confirmation for risky operations.
- Validation feedback near fields.
- Save/loading/error/success states.
- Preview for landing/blog content where relevant.

Landing CMS editor must keep:

- Server-backed content loading.
- Dirty state.
- `expectedUpdatedAt` conflict handling.
- Iframe preview route.
- Draft preview via `postMessage`.
- Section selector and visibility controls.

Aistudio admin concepts worth adapting:

- Better overview/dashboard feel.
- Preview device switch including tablet if feasible.
- Section manager clarity.
- Version/audit vocabulary, but only backed by real data when implemented.

Do not copy:

- Mock `appMode` admin switching.
- Mock localStorage versions/audit logs as production.
- Sample lead generator.
- Unprotected admin actions.

## 7. Content And Data Rules

Business/content data should live in one of:

- Supabase tables and APIs.
- Normalized CMS content through `landing_content`.
- Defaults only as seed/fallback.
- Blog repository for published posts.

Components should not own production data. They may own local UI state only.

Examples of data that must not be hardcoded into components:

- Course names, prices, subject counts, subject lists.
- Lead statuses and admin notes.
- Payment states and amounts.
- Blog post body, publish state, SEO fields.
- Landing CTA, FAQ, footer contact links, and tracking IDs.

## 8. Component Rules

- Keep `src/app/page.js` and route pages as orchestration layers.
- Keep render components focused and named after product concepts.
- Keep helper logic outside JSX when it grows beyond display formatting.
- Do not define large nested components inside page render functions.
- Prefer small pure helpers for formatting, filtering, and mapping.
- Do not grow already-large files without a split plan.

Natural module direction for future consolidation:

- `src/components/landing/sections/*` for landing sections.
- `src/components/admin/landing/*` for landing CMS editor pieces.
- `src/lib/landing/*` or current `src/lib/landing-*.js` for repositories/schema/domain helpers.
- `src/components/ui/*` for reusable primitives.

## 9. Accessibility And Responsiveness

- Forms need labels, error text, and focus states.
- Buttons and links should have clear accessible names.
- Mobile text must not overflow cards/buttons.
- Tables need horizontal overflow handling or responsive alternatives.
- Use Next `<Image>` for real images when possible.
- Do not rely on color alone for status.

## 10. Verification

For UI work:

- `npm run lint`.
- `npm run build`.
- Browser check `/`.
- Browser check `/landing-preview`.
- Browser check `/admin/landing` when admin access is available.

For data/API work:

- Verify server authorization.
- Verify Supabase field names against `docs/database-schema.md`.
- Verify public routes do not leak private/admin data.

For lead work:

- Public submit creates a lead.
- Admin leads list shows it.
- Status/notes updates persist.
