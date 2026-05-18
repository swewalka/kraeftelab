# Canvas Base Visibility Contract

## Task summary

Introduced an explicit canvas visibility contract with renderer-defined base objects plus authored
step-specific visible objects. The beam renderer keeps the beam body and endpoint markers/labels
for A/B visible as base context for every beam problem. Supports, loads, reactions, dimensions,
angle markers, and other overlays remain authored through `visibleObjects` or existing non-authored
mode behavior.

## Changed files

- `src/mechanics/model/canvasState.ts`
- `src/content/problems/parsing.ts`
- `src/content/problems/localeValidation.ts`
- `src/components/diagram/BeamDiagramLayer.tsx`
- `src/app/App.tsx`
- Center-load and angled-load Solve/Practice JSON content in German and English
- `ARCHITECTURE.md`
- `CONTENT_SCHEMA.md`
- `docs/milestones/m01-statics-mvp-foundation/reports/2026-05-15-canvas-base-visibility-contract.md`

## Implementation decisions

- Added optional `CanvasState.hiddenBaseObjects` and parser support.
- Included `hiddenBaseObjects` in German/English locale snapshots so mechanics-critical canvas
  state stays aligned.
- Kept the base-object set local to the beam renderer: `beam`, `pointA`, and `pointB`.
- Made authored Solve/Practice canvas state control load arrows, support symbols, reactions,
  component arrows, dimensions, angle markers, and overlay markers.
- Corrected support rendering so authored supports are not suppressed when authored reactions at the
  same support are also visible.
- Removed the first Solve-step `explore` canvas-mode fallback in `App.tsx`; Solve now consistently
  renders with authored Solve canvas state.
- Removed repeated `beam`, `pointA`, and `pointB` entries from authored Solve/Practice
  `visibleObjects` arrays and from completed-step `revealObjects` arrays.
- Kept `centerLoad` authored as a normal visible object in every center-load Solve/Practice
  `visibleObjects` array because it should appear in every step but is not base context.

## Verification performed

- `npm run typecheck`
- `npm run build`
- `git diff --check`
- Searched Solve/Practice content for `visibleObjects` and `revealObjects` arrays still containing
  `beam`, `pointA`, or `pointB`; none remain.
- Checked center-load Solve/Practice states in German and English for authored `centerLoad`
  visibility in every step.
- Searched the beam renderer to confirm support visibility no longer depends on visible reactions.
- Searched live source and context docs for deprecated canvas fields. Remaining hits are parser
  rejection paths for old input fields.

## What works

- Solve and Practice steps no longer need to repeat stable beam context ids.
- The first Solve step still shows authored supports and applied loads, but now through normal
  Solve canvas state rather than the previous mode fallback.
- Authored support symbols can be shown alongside authored reaction arrows.
- Center-load teaching states show the load through repeated authored visibility entries.
- The beam endpoints and A/B labels remain present by default in authored Solve/Practice states.
- German and English content remain aligned through the existing registration/typecheck path.

## Fragile or questionable

- `hiddenBaseObjects` is supported but not yet used by current content.
- There is still no canvas object-id validation, so misspelled visible or hidden ids are not caught
  with precise diagnostics yet.
- No visual regression screenshots were run; rendering behavior was verified by code path and build
  checks only.

## Future recommendations

- Implement the existing TODO item for validating every canvas object id against known problem,
  diagram, and renderer object ids.
- Add visual regression checks for representative Solve and Practice canvas states before adding
  more diagram object categories.
- Keep renderer base sets intentionally small so authored visibility remains meaningful for
  teaching sequences.

## Context file updates

- Checked `AGENTS.md`, `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `DESIGN.md`, `TODO.md`, and the
  latest 2026-05-15 reports.
- Updated `ARCHITECTURE.md` to document base objects plus authored visible objects.
- Updated `CONTENT_SCHEMA.md` to document `hiddenBaseObjects`, beam base objects, and locale
  alignment expectations.
- `DESIGN.md` did not need changes because binary visibility and focus behavior did not change.
- `TODO.md` did not need changes because canvas object-id validation remains incomplete and was out
  of scope.
