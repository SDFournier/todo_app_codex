# UI primitives guidelines

## Scope
Shared, reusable UI building blocks (buttons, cards, inputs, modals, badges). Feature-specific UI belongs in feature folders, not here.

## Hard rules
- Do not fetch data or call use-cases from UI primitives.
- Keep props minimal and typed; avoid `any`.
- Ensure accessibility basics: proper roles/labels, focus handling for modals, etc.

## Soft recommendations
- Prefer extending existing primitives (e.g., Button variants) before adding new ones.
- Use stable keys when rendering lists; avoid index keys.
- Keep styling consistent; avoid inlining ad-hoc styles that diverge from established patterns.

## Examples
- Good:
  ```tsx
  <Button variant="primary" onClick={onSave}>Save</Button>
  <Card><Card.Header>Title</Card.Header><Card.Body>Content</Card.Body></Card>
  ```
- Bad:
  - Fetching inside a Button or Card.
  - Creating a new button component for a minor style tweak instead of using variants.
  - Using array index as `key` in repeated UI elements.
