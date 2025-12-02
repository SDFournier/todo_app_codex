# Time entries: running, pause/resume, untracked

## Always-on tracking
- Each user keeps exactly one running entry at all times: either a specific activity or the system **Untracked** fallback (`isUntracked = true`).
- Opening Home or requesting header data will create an Untracked entry when none is running.
- Starting any activity (manual label or Quick Start) stops the current running entry (often Untracked) and immediately starts the specific one.
- Stopping or pausing a specific activity immediately starts a new Untracked entry so there are no gaps.
- Untracked entries use the system template/category, are non-productive, and never expose a Stop button.

## Running vs paused (UI semantics)
- DB still has only running vs stopped; pause remains a UI concept.
- Pausing stops the current entry (computes duration) and keeps a "paused candidate" in UI state.
- Resuming creates a **new** running entry with the same template/title, stopping the current running entry (usually Untracked).
- Starting any new timer clears the paused candidate.

## Controls and cards
- **Running state:** shows category pill/dot, title (override > template > fallback), live timer, actions for Pause + Stop. Stop/ Pause trigger Untracked fallback creation.
- **Untracked state:** neutral strip with `UNTRACKED TIME` pill, large timer, helper text, and CTAs to start a new activity or jump to Quick Starts. No Stop button is rendered.
- **Paused candidate:** surfaced inside the Untracked state with a Resume button.
- Visual hierarchy: category pills are solid color with white text; state/info pills (Running/Untracked) are soft/outlined; timers use a larger right-aligned weight in the status card.

## Quick Starts
- Quick Start = `TaskTemplate.isQuickStart` and not archived/system/untracked.
- Inline chips live inside the main card when Untracked is active; the dedicated Quick Start card reuses the same chips and links to Settings.
- Promote action still toggles the same flag on entries that have a template.

## Notes
- Main category is stored on entries (and added to assigned categories) when available; Untracked uses the untracked category and stays non-productive.
- Title display order: `titleOverride` > template name > `"Untitled entry"`; Untracked shows `"No specific activity"`.
- Manual edits/deletes may create gaps or overlaps; future routines can backfill with `isUntracked` entries if needed.
