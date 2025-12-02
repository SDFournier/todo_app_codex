# Product & UI/UX Overview (Time Tracker)

## App scope & core flows
- Track time: start/stop live entry, create manual entry, edit/delete, soft delete, mark running.
- Templates: manage task templates; quick-start common tasks.
- Categories: dimensions/values for tagging entries and templates; assign categories.
- Analytics: daily/range summaries (duration, counts).
- Rules: all mutations go through use-cases; UI/components must not talk to Prisma/DB directly.

## Current UX patterns
- Home dashboard: running entry card, quick-start list, recent entries, daily summary card with progress.
- Header: global compact glance (current entry/untracked, clock, 1-line day progress).
- Lists: stable keys, badges for status/duration, concise meta text.
- Today-at-a-glance card: richer mini-analytics (entries count, total time, productive vs other, goal progress).
- Forms/validation: Zod in API routes; shared fragments in `src/infra/http/validationSchemas.ts`.
- Error handling: `withErrorHandling` + `errorUtils`; optional bodies use `readJsonOrDefault`, required bodies use `req.json()` to surface 400s.

## Design system (tokens to reuse)
- Colors:
  - primary `#7C3AED`, primarySoft `#F3E8FF`, accent `#EAB308`
  - background `#F6F5F1`, surface `#FFFFFF`, border `#E2E0DA`
  - textMain `#0F172A`, textMuted `#6B7280`, textOnPrimary `#FFFFFF`
  - success `#16A34A`, warning `#F59E0B`, error `#DC2626`
- Typography: h1 28–32 semibold; h2 24; h3 18–20; h4 16; body 16; small 14; caption 12.
- Spacing (px): 8, 12, 16, 20, 24, 32 (space-2 … space-8).
- Radius: sm 4px (chips/inputs), md 8px (cards/buttons), lg 12px (modals), full pill.
- Shadows: soft (cards) 0 4px 12px rgba(15,23,42,0.06); strong (modals) 0 8px 20px rgba(15,23,42,0.12).
- Buttons: primary (primary bg, textOnPrimary; hover darken), secondary (surface bg, border; hover primarySoft), ghost (transparent; hover primarySoft). Disabled uses muted/soft.
- Cards: surface bg, border, radius md, shadow soft, space-4/5 padding.
- Tags/chips: primarySoft bg + primary text; status chips use success/warning/error with readable text.
- Time/date formatting: use `src/lib/time/format.ts` (duration, date range, date time) instead of inline formatting.

## Architecture alignment (reminders)
- Layers: core (domain/use-cases) ← infra (Prisma/repos/http helpers) ← app (routes/UI/hooks). No infra in UI/hooks.
- API routes: use `withErrorHandling`, Zod validation, shared validation fragments, `createUseCases`; no direct Prisma.
- UI primitives (`src/components/ui`): dumb, typed, no data fetching. Time-tracker components are presentational; data comes from hooks.
- Hooks (`src/hooks`): follow Rules of Hooks, no infra/Prisma; keep focused and typed.
- Imports: use `@/...` (baseUrl `src`); avoid deep relative paths.

## Future-aligned ideas (keep light)
- Add feature-level README when a feature grows (scope, rules, do/don’t, examples).
- Keep analytics/summary visuals clear and compact; prefer badges, progress, concise text.
- Consider consistent empty/loading states and error toasts/snackbar for UX polish.
- If adding more status/category visuals, extend chips with status colors; reuse tokens instead of new ad-hoc colors.

## Good vs bad (patterns to follow)
- Good: `const parsed = schema.parse(await readJsonOrDefault(req, {}));` for optional body routes; `formatDurationShort(durationSeconds)` in UI; cards using surface/border/radius/shadow tokens.
- Bad: inline `new Date().toLocaleString()` everywhere; `any` mappers; API routes bypassing use-cases; components fetching directly from Prisma/DB; ad-hoc colors/styles outside tokens.
