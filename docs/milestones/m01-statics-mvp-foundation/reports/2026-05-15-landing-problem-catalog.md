# Landing Problem Catalog

## Task summary

Added a simple landing page where learners choose between the two implemented statics problems,
grouped by topic. The page is catalog-driven and keeps German/English problem content aligned by
using the existing localized `problemCatalog`.

## Changed files

- `src/app/App.tsx`
- `src/components/landing/ProblemCatalogLanding.tsx`
- `src/components/layout/AppShell.tsx`
- `src/i18n/translations.ts`
- `ARCHITECTURE.md`
- `TODO.md`

Follow-up adjustments:

- Trimmed landing problem cards to title, type, and start action only.
- Removed the in-workspace problem dropdown.
- Made the KraefteLab header wordmark return to the landing overview.

Second follow-up adjustments:

- Moved the mode tabs from the right problem panel into the workspace header.
- Reordered modes to Solve, Practice, Explore.
- Updated German mode labels to `Erklären`, `Üben`, and `Erkunden`.

## Implementation decisions

- Kept state local to `App` instead of adding routing.
- Built the landing page from `problemCatalog[locale]` so future problems appear without changing
  the component.
- Grouped by `problem.topic` and added one localized topic label for the current
  `statics.equilibrium` topic.
- Kept the existing in-workspace problem dropdown and added an overview button back to the catalog.

## Verification performed

- `npm run typecheck`
- `npm run build`

## What works

- The app starts on the landing page.
- German and English landing labels are available through the i18n layer.
- Selecting either implemented problem opens the existing mechanics workspace.
- The workspace can return to the landing overview.

## Fragile or questionable

- Topic labels currently use a small local map in the landing component. This is fine for one topic
  but should become a shared catalog/topic helper if more topic families are added.
- There is still no URL/deep-link routing for a selected problem.

## Future recommendations

- Add route state only when direct links or browser navigation become necessary.
- Consider adding a short topic metadata layer once the content library has multiple topic groups.

## Context file updates

- Checked `AGENTS.md`, `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `DESIGN.md`, and `TODO.md`.
- Updated `ARCHITECTURE.md` to document the catalog landing flow.
- Updated `TODO.md` by removing the completed catalog/preview panel item.
- `CONTENT_SCHEMA.md` and `DESIGN.md` did not need changes because the content schema and design
  conventions were not altered.
