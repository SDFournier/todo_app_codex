# UI & UX Guidelines

These guidelines align with architecture docs and should be followed for every front-end change.

## App scope & key use cases
- Track time entries: start/stop a running timer, create manual entries, edit/delete, assign categories/templates.
- Surface quick starts (task templates) for fast entry creation.
- Show recent entries and daily summaries (duration, counts).
- Keep all mutations behind use-cases via API routes (no direct DB/Prisma in UI).

## Components & responsibilities
- **UI primitives (`src/components/ui`)**: dumb, reusable building blocks (no data fetching, no use-cases).
- **Time tracker components (`src/components/time-tracker`)**: present time-entry data, trigger start/stop/edit/delete via callbacks provided by callers.
- **Hooks (`src/hooks`)**: encapsulate client data-fetch/state; no infra/Prisma imports.

## Hard rules (must)
- No direct data fetching or use-case/Prisma access inside UI primitives.
- Route handlers: `withErrorHandling` + Zod validation; use shared validation fragments.
- Use shared formatters (`src/lib/time/format.ts`) for durations/date ranges; do not duplicate formatting inline.
- Use alias imports `@/...` (baseUrl `src`); avoid deep relative paths.
- Use stable keys in lists (never array indices).

## Soft recommendations (should)
- Keep handlers/hook logic small and focused; derive data instead of duplicating state.
- Use consistent layout/padding and typography for cards/lists; prefer existing Button/Card variants over ad-hoc styles.
- For optional request bodies, use `readJsonOrDefault`; for required bodies, use `req.json()` so Zod returns 400 on missing payloads.
- Provide clear empty states and concise statuses (Badges) for lists.
- Keep error messaging user-friendly; log details server-side.

## Color palette (tokens)
| Token          | Hex      | Usage                                      |
| -------------- | -------- | ------------------------------------------ |
| `primary`      | #7C3AED  | Main actions/CTAs                          |
| `primarySoft`  | #F3E8FF  | Subtle backgrounds/hover                   |
| `accent`       | #EAB308  | Secondary highlights/info                  |
| `background`   | #F6F5F1  | App page background (warm)                 |
| `surface`      | #FFFFFF  | Cards, panels, modals                      |
| `border`       | #E2E0DA  | Dividers, card borders, inputs             |
| `textMain`     | #0F172A  | Primary text                               |
| `textMuted`    | #6B7280  | Secondary text, meta info                  |
| `success`      | #16A34A  | Success states                             |
| `warning`      | #F59E0B  | Warnings                                   |
| `error`        | #DC2626  | Errors                                     |
| `textOnPrimary`| #FFFFFF  | Text on `primary`/`accent` backgrounds     |

## Patterns & examples
- **Time formatting (good)**:
  ```ts
  import { formatDurationShort, formatDateRange } from '@/lib/time/format';
  formatDurationShort(elapsedSeconds); // "1h 12m"
  formatDateRange(start, end);         // "3/10/2025, 9:02 AM – 11:15 AM"
  ```
- **List rendering (good)**:
  ```tsx
  {items.map((item) => (
    <Card key={item.id}>...</Card>
  ))}
  ```
- **Bad**:
  - Inline `new Date(...).toLocaleString()` formatting repeated across components.
  - Buttons or Cards performing fetch/DB work.
  - Using array index as `key`.

## Market cues (keep UX simple)
- Keep the flow similar to lean time trackers (e.g., start/stop prominent, quick starts accessible, recent entries readable).
- Avoid clutter; prefer clear CTA buttons and concise badges over heavy chrome.
