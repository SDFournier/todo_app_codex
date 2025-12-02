# Categories: main category, productivity, and tags

## Main category
- `TaskTemplate.mainCategoryValueId`: optional category a template highlights as “main”. When an entry is created from the template, application code should set the entry’s `mainCategoryValueId` accordingly (and include it in the assigned categories).
- `TimeEntry.mainCategoryValueId`: optional category to treat as primary for UI/analytics. Invariant to enforce in use-cases: if set, it must also exist in `TimeEntryCategory` for that entry.
- Named relations avoid conflicts with the existing many-to-many:
  - TaskTemplate → CategoryValue uses relation `"TaskTemplateMainCategory"`.
  - TimeEntry → CategoryValue uses relation `"TimeEntryMainCategory"`.
- Indexed by `[userId, mainCategoryValueId]` for quick queries/analytics.

## Productivity flag
- `CategoryValue.isProductive` (default false) marks whether a category is productive.
- An entry is considered productive if:
  - Its `mainCategoryValue` is productive, **or**
  - Any assigned category on the entry is productive.
- Indexed by `[userId, isProductive]` for filtering/analytics.

## Untracked flag
- `CategoryValue.isUntracked` marks the system untracked bucket (neutral, non-productive).
- Managed automatically per user and paired with the system Untracked template; not intended for manual toggling in UI.

## Meta tags
- `CategoryValue.metaTags` (Json?) can hold arbitrary labels (e.g., `["healthy", "rest", "learning"]`).
- Use tags for future analytics/filtering without schema changes.

## Notes for implementers
- Enforce “main category must be in assigned categories” in use-cases, not in the DB.
- When updating template main category, consider auto-updating related entry defaults as needed in application logic (not schema-enforced).
