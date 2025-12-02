# Infra layer guidelines

## Scope
Implements infrastructure concerns: Prisma repositories, HTTP helpers (error handling, validation fragments, request parsing), logging, env access.

## Hard rules
- Infra depends on core; core must not import infra.
- Repositories must use Prisma and map to domain types via `src/infra/repositories/prisma/mappers.ts` (no `any`).
- API routes must use `withErrorHandling` and Zod validation; use `validationSchemas` fragments where applicable.
- Use alias imports `@/infra/...` (baseUrl=src).

## Soft recommendations
- For optional request bodies, use `readJsonOrDefault`; for required bodies, use `req.json()` so Zod surfaces 400s.
- Keep repo methods thin: input → Prisma → mapper → return domain.
- Extend `errorUtils` for common infra errors (Zod, Prisma codes) rather than per-route handling.
- Prefer small, targeted utilities over catch-all helpers.

## Examples
- Good (repo mapping):
  ```ts
  const entity = await prisma.timeEntry.create({ data });
  return mapTimeEntry(entity);
  ```
- Good (API route parse/validate):
  ```ts
  const body = await readJsonOrDefault(req, {}); // only if body optional
  const parsed = schema.parse(body);
  return NextResponse.json(result, { status: 201 });
  ```
- Bad:
  - Returning raw Prisma models to app/domain.
  - Inline `any` mappers; duplicated UUID/text Zod rules.
  - Custom per-route try/catch instead of `withErrorHandling`.
