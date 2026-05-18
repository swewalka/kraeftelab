# Solve Mode Step Canvas State Report

Date/time: 2026-05-11 19:51 Europe/Vienna

## Task summary

Added authored `canvasState` support to solution steps so Solve Mode can control diagram
visibility, highlights, dimmed objects, solved objects, and solved value labels per explanation
step.

## Changed files

- `src/mechanics/model/canvasState.ts`: added neutral shared `CanvasState`.
- `src/mechanics/explanation/*`: solution steps now carry optional canvas state.
- `src/content/problems/parsing.ts`: parses `solution.steps[].canvasState` with the same parser used
  by practice steps.
- `src/content/problems/localeValidation.ts`: compares solution canvas-state ids across locales.
- `src/app/App.tsx`: passes active solution-step canvas state in Solve Mode and practice-built
  canvas state in Practice Mode.
- `src/components/diagram/*`: diagram interaction state now depends on the neutral canvas-state
  type; the beam renderer respects authored Solve canvas state when present.
- Existing beam solution JSON files: added self-contained canvas states for German and English.
- `ARCHITECTURE.md` and `CONTENT_SCHEMA.md`: documented the shared contract and schema.

## Implementation decisions

Practice-specific behavior remains in Practice Mode. `PracticeCanvasState` is now a compatibility
alias for `CanvasState`, but practice still owns active-step selection, completed-step reveal
accumulation, answer validation, hints, and canvas-click selection.

Solve Mode uses authored solution-step states directly. These states are intentionally
self-contained, so later solution steps repeat previously solved reactions and labels when those
should remain visible.

The beam renderer preserves the old broad free-body fallback when Solve Mode has no authored
canvas state. When a Solve step does provide state, optional free-body reactions and overlays are
shown only when the state makes them visible or solved. Dimensions remain generally rendered, but
they can be highlighted or dimmed by id.

The first Solve step still uses the existing canvas mode fallback that shows the supported beam
instead of the free-body view, which keeps support identification visible.

## Verification performed

- `npm run typecheck`
- `npm run build`

The production build completed successfully and evaluated localized problem registration.

## What works

Both beam problems now have step-specific Solve canvas states in German and English. The angled
load explanation can show decomposition arrows only during the relevant steps and carry solved
reaction labels forward. The center-load explanation can highlight supports, reactions, moment-arm
dimensions, and solved values across its guided steps.

Practice Mode still receives the state produced by `buildPracticeCanvasState`, so completed-step
accumulation remains separate from Solve Mode.

## Fragile or questionable

Canvas object ids are still string references. Locale validation catches German/English drift, but
there is no general validator yet that proves every canvas-state id exists in the selected diagram
configuration or problem definition.

Manual browser inspection was not automated in this pass. The build verifies content loading and
TypeScript contracts, but not visual framing of every step.

The beam renderer remains beam-specific. This task improves state control but does not introduce
renderer-agnostic overlay primitives.

## Future recommendations

Add diagram-id validation for canvas states once more diagram object categories are stable.
Consider a small visual regression test for representative Solve and Practice canvas states before
adding many more authored states.

## Context file updates

Checked `AGENTS.md`, `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `DESIGN.md`, and the two previous
agent reports.

Updated `ARCHITECTURE.md` because the Solve/Practice canvas-state boundary changed.

Updated `CONTENT_SCHEMA.md` because solution steps now accept `canvasState`.

`DESIGN.md` did not need changes because this task did not change visual style conventions.

## Follow-up: symbolic-only Solve Mode

After implementation, the product requirement was clarified: Solve Mode, like Practice Mode,
should work with variables only. Real numeric values are reserved for future Explore Mode.

Changes made in response:

- Removed numeric result summary rendering from Solve Mode.
- Removed `solution.resultSummaryTitle` from the parsed solution contract and existing solution
  JSON files.
- Simplified solver-generated equation display data to symbolic equations only; numeric
  `substituted` and `solved` equation strings are no longer generated or rendered.
- Updated center-load solution prose/math from numeric values (`12 kN`, `3 m`, `6 m`) to symbolic
  variables (`F`, `L`, `L/2`).
- Removed the unused numeric result-summary component and unit-formatting helper.
- Updated `ARCHITECTURE.md` and `CONTENT_SCHEMA.md` to document symbolic-only Solve content.

Verification after follow-up:

- `npm run typecheck`
- `npm run build`

## Follow-up: final reaction result blocks and practice debug advance

Added a `tone: "result"` option for math content blocks and used it for final support reaction
formulas in both Solve Mode and final Practice feedback. The result tone is visually distinct from
ordinary equation blocks and should remain reserved for final answers.

Added a temporary Practice Mode debug advance button (`Debug: Weiter` / `Debug: next`) to complete
the active step and move to the next step without validation. On the final step, it marks the step
complete and shows the correct feedback, which makes the final result block easy to inspect.

Updated `CONTENT_SCHEMA.md` and `DESIGN.md` for the new result math block convention.

Verification after this follow-up:

- `npm run typecheck`
- `npm run build`
