# Canvas Object ID Validation

## Task summary

Added registration-time validation for authored canvas object references so misspelled
`visibleObjects`, `hiddenBaseObjects`, and `revealObjects` entries fail before content reaches the
app.

## Changed files

- `src/mechanics/diagram/beamDiagramConfig.ts`
- `src/mechanics/diagram/diagramObjectRegistry.ts`
- `src/components/diagram/BeamDiagramLayer.tsx`
- `src/components/diagram/diagramRegistry.tsx`
- `src/content/problems/parsing.ts`
- `ARCHITECTURE.md`
- `CONTENT_SCHEMA.md`
- `TODO.md`
- `docs/agent-reports/2026-05-15-canvas-object-id-validation.md`

## Implementation decisions

- Moved the beam diagram config parser and config types out of the React renderer into a pure
  mechanics diagram module.
- Added beam diagram helpers for renderer object ids, base object ids, dimension fallback ids, and
  diagram-config reference validation.
- Added a pure diagram object registry keyed by `diagramKey`; current support is `beam-diagram`.
- Validated solution and practice `canvasState.visibleObjects` against known problem object ids,
  reaction ids, force-decomposition component ids, and renderer object ids.
- Validated practice `successResult.revealObjects` against the same visible-object id set.
- Validated `hiddenBaseObjects` against renderer base ids only.
- Used exact authored paths in diagnostics, including array indexes.

## Verification performed

- `npm run typecheck`
- `npm run build`
- `git diff --check`
- Bundled and imported `src/content/problems/catalog.ts` with esbuild and Node to execute
  registration-time parsing and validation.

## What works

- Current German and English content registers successfully under the stricter checks.
- Typos in authored canvas visibility arrays now fail with paths such as
  `solution.steps[2].canvasState.visibleObjects[0]`.
- Beam diagram config references now fail during registration instead of waiting for renderer
  execution.

## Fragile or questionable

- The content registration object registry is separate from the React `diagramRegistry`, so future
  diagram renderers must be added to both places until a shared adapter shape exists.
- Force-decomposition component ids are accepted as known canvas ids because they are mechanics
  contracts, but the current beam renderer shows component arrows by renderer overlay id.
- There are still no visual regression checks for representative canvas states.

## Future recommendations

- Give future diagram adapters a shared pure validation/object-id contract so rendering and content
  registration cannot drift.
- Add visual regression checks for Solve and Practice canvas states after validation catches the
  authoring typo class.
- Consider improving locale-validation diagnostics next; it remains a separate TODO item.

## Context file updates

- Checked `AGENTS.md`, `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `DESIGN.md`, `TODO.md`, and recent
  canvas visibility reports.
- Updated `ARCHITECTURE.md` to document registration-time canvas and diagram config validation.
- Updated `CONTENT_SCHEMA.md` to document valid canvas object id sources and hidden base id rules.
- Updated `TODO.md` to remove the completed canvas object-id validation item.
- `DESIGN.md` did not need updates because visual behavior and binary visibility rules did not
  change.
