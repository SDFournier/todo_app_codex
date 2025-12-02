# Settings / Configuration

## Role vs Home
- Home (`/`): frequent actions (start/stop/resume timers, quick fixes, quick-start chips). No deep editing.
- Settings (`/settings`): occasional configuration with broader impact (templates, goals, categories). No timer start actions here.

## Structure
- Route: `/settings` with client-state tabs for sections (Templates, Goals, Categories, Untracked placeholder).
- Header remains visible; navigation includes Home and Settings links.

## Templates section
- Canonical editor for `TaskTemplate`:
  - List templates (filter archived toggle), edit, archive/unarchive.
  - Quick Start toggle uses `TaskTemplate.isQuickStart` (manual pin).
  - Create/edit templates with name/description/Quick Start, optional color, categories and a main category (main must be among selected categories; template color defaults to main category when unset).
- Home Quick Start uses the same `isQuickStart` flag (`isArchived = false`).
- The Untracked system template/category (`isSystem` + `isUntracked`) is created automatically per user, hidden from template lists/Quick Starts, and powers the fallback running entry.

## Goals section
- Simple editable daily focus goal (currently stored locally); intended to feed header/analytics when wired to backend config.

## Categories section
- Basic management of category dimensions + values:
  - **Dimensions** are high-level axes (domains, moods, focus areas) that group related category values.
  - Create a dimension first, then add category values (label/code/color) inside it.
- Dimensions/values drive future templates and entries (main category, productivity, quick-start labels).

## Quick Start relationship
- Quick Start = manual pin (`isQuickStart = true`).
- Home can "Promote to Quick Start" (sets the same flag) and start timers.
- Settings manages Quick Start status in bulk; does not start timers.
