# Canvas Visibility State Cleanup

## Task summary

Reworked Solve and Practice canvas state from mixed visibility, highlight, dimming, solved-object,
and solved-value semantics to a binary visibility model.

## Changed files

- `src/mechanics/model/canvasState.ts`
- `src/mechanics/practice/types.ts`
- `src/mechanics/practice/session.ts`
- `src/content/problems/parsing.ts`
- `src/content/problems/localeValidation.ts`
- `src/components/diagram/overlayStyle.ts`
- `src/components/diagram/BeamDiagramLayer.tsx`
- Beam solution and practice JSON content in German and English
- `ARCHITECTURE.md`
- `CONTENT_SCHEMA.md`
- `DESIGN.md`

## Implementation decisions

- `CanvasState` now supports only `visibleObjects` and `annotations`.
- Practice `successResult` now supports only `revealObjects`.
- Deprecated fields fail during parsing: `highlightedObjects`, `dimmedObjects`, `solvedObjects`,
  canvas-level `solvedValues`, practice `markObjectsSolved`, and practice success `solvedValues`.
- Diagram objects authored through canvas state render at normal opacity when visible. They are not
  dimmed or specially highlighted.
- The beam itself and external load arrows remain base diagram context; authored visibility controls
  supports, reactions, overlays, point labels, dimensions, angle markers, and interaction hit rings.
- Existing content was migrated by unioning previous `visibleObjects`, `highlightedObjects`,
  `dimmedObjects`, `solvedObjects`, and solved-value ids into `visibleObjects`. Practice completion
  solved ids were moved into `revealObjects`.

## Verification performed

- `npm run typecheck`
- `npm run build`
- Searched source and content for old canvas fields after migration. Remaining references are only
  parser errors for deprecated input fields.

## What works

- The old full-opacity versus dimmed-opacity state split is removed from renderer logic.
- Bilingual content now uses one canvas visibility field.
- Practice can still carry completed-step diagram reveals forward with `revealObjects`.

## Fragile or questionable

- There are still no visual regression checks for representative Solve and Practice canvas states.
- The first Solve step continues to use the existing `explore` canvas-mode fallback.
- External loads remain always visible as base problem context, so `visibleObjects` is not a full
  hide/show switch for applied loads in the current beam renderer.

## Future recommendations

- Add visual regression checks before expanding the content library.
- Add explicit canvas-object id validation once renderer object categories are stable.
- Revisit whether applied loads should become authored visibility objects when future problems need
  staged load reveal.

## Context file updates

- Updated `ARCHITECTURE.md` to describe the binary canvas-state contract.
- Updated `CONTENT_SCHEMA.md` to remove highlight, dimming, solved-object, and solved-value canvas
  fields.
- Updated `DESIGN.md` to replace opacity-based canvas focus with binary visibility.
- Checked `TODO.md`; no item was completed by this cleanup.
