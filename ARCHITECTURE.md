# Architecture & Conventions

## Layers and boundaries
- **core/**: pure domain (types, use-cases, ports). No imports from infra/app/react/next. No Prisma/HTTP/DB access.
- **infra/**: implementations (Prisma repos, HTTP helpers, validation/error utilities). Depends on core, never the other way around.
- **app/** (Next App Router): route handlers and UI. Route handlers call use-cases only (via `createUseCases`), never touch Prisma/DB directly.
- **components/**, **hooks/**: UI and client logic. Never import infra/Prisma. For server-only work, use server components or API routes/use-cases.

## Hard rules (must)
- No direct DB/Prisma calls from app/components/hooks; all mutations go through use-cases.
- API routes must wrap handlers with `withErrorHandling` and validate with Zod.
- Use shared validation fragments from `src/infra/http/validationSchemas.ts` where applicable.
- Use shared mappers in `src/infra/repositories/prisma/mappers.ts` for Prisma ↔ domain mapping (no `any`).
- Use alias imports `@/...` (configured to `src/`); avoid brittle relative traversals.
- Analytics/time calculations derived from API/Prisma data (totals, percentages, aggregates) must live in and be reused from `src/lib/analytics/dayInsights.ts`; extend helpers there instead of duplicating logic in components.

## Soft guidance (should)
- Prefer small, focused helpers over inline duplication (e.g., `readJsonOrDefault` for optional bodies).
- Keep route handlers thin: get userId → parse JSON → Zod → call use-case → respond.
- Keep domain logic in use-cases; keep UI presentational where possible.
- Add brief feature-level READMEs when a feature folder grows (scope, rules, examples).

## Examples
- Good (API route pattern):
  ```ts
  const body = await readJsonOrDefault(req, {}); // optional body
  const parsed = schema.parse(body);
  const result = await createUseCases().startTimeEntry({ userId, ...parsed });
  return NextResponse.json(result, { status: 201 });
  ```
- Bad:
  - Prisma queries in components or API routes bypassing use-cases.
  - Ad-hoc JSON parsing with `req.json()` on optional bodies causing 500s.
  - Duplicating Zod UUID/string rules inline instead of reusing fragments.
