# Analytics feature (MVP)

## Purpose
- Provide a top-level Analytics tab focused on historical performance: summary, categories, timeline, templates, and untracked insights.
- Keeps the global header (CURRENT / NOW / TODAY) visible, consistent with Home/Settings.

## Periods & comparison
- Presets: Today (hour buckets), This week/This month (day buckets), This year (month buckets), Custom (day buckets).
- Comparison: none, previous period (same length), or custom range.
- Entries are attributed to the period containing `startedAt` (no cross-day splitting for now).
- Running entries and soft-deleted entries are excluded from analytics.

## Filters
- Categories (OR logic across selected values; main category is included).
- Templates (multi-select).
- Productivity mode: All | Productive only | Non-productive | Untracked only.
- Untracked detection: entry `isUntracked` flag, untracked main category, or any untracked category.
- Productive detection: productive main category or any productive category.

## Cards
- **Summary**: KPI row + stacked comparison bars for total/productive/other/untracked (+ deltas when comparison is active).
- **Time by main category**: horizontal bars sorted by duration (click to filter by main category).
- **Timeline**: bucketed totals with a toggle between total and productive views.
- **Top templates**: duration and entry count per template (not always shown in UI when focusing on the core cards).
- **Untracked insights**: donut + KPIs (untracked duration, share of tracked time, warning if >30%).

## Implementation notes
- API: `POST /api/analytics` returns a typed report assembled in `src/infra/analytics/analyticsService.ts`.
- Data source: `listTimeEntriesByRange` use-case; grouping is done in-memory for ranges up to ~90 days (swap to aggregates later if needed).
- Filters and comparison are applied on both primary and comparison datasets before aggregation.
- Known simplification: entries are not split when they span multiple buckets; they count toward the bucket of `startedAt`.
