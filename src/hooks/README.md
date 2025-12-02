# Hooks guidelines

## Scope
Reusable client hooks (data fetching, derived state, timers) that are UI-agnostic. Feature-specific hooks belong in their feature folders.

## Hard rules
- Follow the Rules of Hooks: no conditional calls, no loops.
- Hooks must not import Prisma/infra; they may call API routes or use use-cases via server actions where appropriate.
- Keep return shapes typed; avoid `any`.

## Soft recommendations
- Prefer a small hook per concern (e.g., `useRunningEntry`, `useRecentEntries`) over “kitchen sink” hooks.
- Derive data instead of storing duplicates in state; memoize when needed.
- Handle loading/error states consistently; consider reusing a common pattern across hooks.

## Examples
- Good:
  ```ts
  const { data, error, isLoading } = useRunningEntry(userId);
  ```
- Bad:
  - Mixing multiple unrelated concerns in one hook.
  - Duplicating fetch/effect logic across components instead of a shared hook.
  - Storing derived values in state when they can be computed from props/data.
