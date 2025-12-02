# Header feature

## What it shows
- **Current entry**: category pill (neutral for Untracked), title (override > template name > fallback), live timer, and a secondary line (`Tracking focused activity` vs `Tracking untracked time`). There is always a running entry (specific or Untracked).
- **Current date/time**: today’s date and current time, updating every second on the client.
- **Day progress**: productive vs other tracked time for today, progress toward a productive goal, with a compact progress bar and labels (Untracked is shown separately, not counted as productive).

## Concepts
- **Main category**: `TimeEntry.mainCategoryValueId` (or template’s main category). Stored on the entry and included in assigned categories.
- **Productive**: an entry is productive if its main category is productive OR any attached category is productive (`CategoryValue.isProductive`).
- **Untracked time**: persisted fallback entries (`isUntracked = true`) started automatically when nothing specific is running; always non-productive.
- **Meta tags**: `CategoryValue.metaTags` can hold conceptual labels (e.g., `["healthy", "rest"]`) for future filtering/analytics.

## Data sources
- `getHeaderDataForUser(userId)`: server-side helper returning `{ currentEntry, nowIso, dayProgress, dayStartIso, dayElapsedSeconds, todayEntries }`.
  - Uses `ensureRunningEntry` to start an Untracked entry when none is running.
  - Fetches the running entry (with main category and categories) and today’s entries to compute productive vs other vs untracked time and entry count.
  - Goal seconds default: 6h (can be made configurable).

## UI composition
- `AppHeader` (client): renders `HeaderCurrentEntry`, `HeaderDateTime`, `HeaderDayProgress`.
- Tokens: uses global design tokens (`globals.css`) for colors, radius, shadows; buttons/cards/badges use shared UI primitives.
- `useElapsedTime` hook drives live timers on the client.
- Visual hierarchy: header labels are small uppercase; category pills are solid with white text; state lines are muted 12–13px; timers are compact (12–13px) and right-aligned; header bar uses reduced padding to feel like a status strip.

## Rules
- No direct Prisma/DB in components; data is provided via server helper.
- Use shared formatters (`src/lib/time/format.ts`) and design tokens; no inline ad-hoc styling.
- Keep components presentational; interactions (navigate/edit) should be wired by parent pages as needed.
- Title display: `titleOverride` > template name > `"Untitled entry"`; Untracked displays `"No specific activity"`.
