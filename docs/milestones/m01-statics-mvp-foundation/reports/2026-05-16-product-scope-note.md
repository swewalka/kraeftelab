# Product Vision Note

## Task summary

Created a first product-vision note for KraefteLab based on clarified product decisions from the
project owner. The note captures target audience, product role, current MVP status, near-term
mechanics topic scope, learning-mode intent, and recurring mechanics building blocks.

The unclear long-term authoring/workspace vision was intentionally not committed as planned product
work.

## Changed files

- product vision document
- `AGENTS.md`
- `docs/milestones/m01-statics-mvp-foundation/reports/2026-05-16-product-scope-note.md`

## Implementation decisions

- Added the product vision document at the repository root so future agents can treat it as a first-class
  context document.
- Updated `AGENTS.md` to include the product vision document in the list of context files to inspect before
  implementation.
- Kept the note limited to clarified scope and added only a short "not decided yet" statement for
  the freeform workspace idea.

## Verification performed

- Read back the product vision document.
- Reviewed the `AGENTS.md` context-file list.
- No code checks were run because this was a documentation-only product-vision change.

## What works

- Future agents now have a direct product-goal document instead of inferring product scope only from
  architecture rules, TODOs, and prior reports.
- The document distinguishes committed near-term scope from the unresolved workspace/authoring
  concept.

## Fragile or questionable

- The freeform workspace, authoring, sharing, and solver expectations remain intentionally
  unresolved.
- Explore mode is documented directionally, but exact UI behavior and allowed parameter types still
  need product and technical decisions.

## Future recommendations

- Discuss the workspace/authoring concept separately before adding it to committed product work.
- Clarify whether Explore mode should support only numeric parameter sliders at first or also
  logical toggles such as adding/removing loads.
- Clarify the order of the next mechanics topics after the completed beam Statics MVP.

## Context file updates

- Checked `AGENTS.md`, `ARCHITECTURE.md`, and `TODO.md`.
- Added the product vision document.
- Updated `AGENTS.md` so the product vision is part of the expected future-agent context.
- `ARCHITECTURE.md` and `TODO.md` did not need changes because no architecture contract or backlog
  item changed.
