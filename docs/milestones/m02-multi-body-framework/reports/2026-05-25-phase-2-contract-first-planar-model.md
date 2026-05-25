# Phase 2 Contract-First Planar Mechanics Model

## Task summary

Implemented the first Phase 2 slice as an additive mechanics/content contract. Existing beam
problems stay on the compatibility path, while future M02 target content can declare planar bodies,
scopes, joints, ropes, generic quantities, and force actions.

## Changed files

- `src/mechanics/model/types.ts`
- `src/mechanics/model/problemDefinition.ts`
- `src/content/problems/parsing.ts`
- `src/mechanics/semantic/parsing.ts`
- `src/mechanics/semantic/types.ts`
- `src/mechanics/semantic/equations.ts`
- `src/content/problems/localeValidation.ts`
- `src/content/problems/contractChecks.ts`
- `src/content/problems/catalog.ts`
- `ARCHITECTURE.md`
- `CONTENT_SCHEMA.md`
- `CURRENT_STATE.md`
- `docs/milestones/m02-multi-body-framework/TODO.md`

## Implementation decisions

- Added a default M02 coordinate system: positive x right, positive y up, positive moment
  counterclockwise, and degree angles.
- Added `dimensionless` plus shared mechanics units so parameters and quantities can represent
  values such as ladder `lambda` and moment units.
- Kept `rigidBeam` unchanged and added `rigidBody` geometry references for line segments,
  polylines, and discs.
- Added generic `quantities` while keeping `unknownReactions` as the current beam compatibility
  quantity path.
- Added `freeBodyScopes`, hinge `joints`, `ropes`, and `forceActions` with external/internal
  ownership and optional `oppositeActionId` for action-reaction pairs.
- Extended semantic equations so `quantityId` may reference generic quantities and scopes may use
  body groups.
- Extended canvas object validation and locale alignment to include Phase 2 planar ids.
- Added a lightweight contract self-check that runs during catalog module loading because the repo
  does not currently have a dedicated test runner.

## Verification performed

- Ran `npm run typecheck`.
- Ran `npm run build`.
- Ran the Phase 2 contract self-check through Vite SSR module loading.
- Existing localized beam problem registration still compiles and builds.

## What works

- Existing center-load and angled-load beam problems still build through the current solver,
  semantic equation, Practice, diagram, and locale-validation path.
- Parser validation catches missing planar body/scope/quantity/action/canvas references.
- Locale validation catches English/German mismatches in the new mechanics-critical fields.
- Semantic equations can reference generic Phase 2 quantities and body-group scopes.

## Fragile or questionable

- The generic planar solver is not implemented yet; generic quantities are parseable but are not
  solved unless a solver later emits values for them.
- The generic planar diagram renderer is not implemented yet; Phase 2 ids are validated for canvas
  state but not rendered by the current beam renderer.
- The self-check is intentionally small and supplements build-time registration; it is not a full
  unit-test suite.

## Future recommendations

- Phase 3 should consume `freeBodyScopes`, `quantities`, and `forceActions` rather than adding a
  parallel solver-specific problem model.
- Phase 4 should let generic diagram scene ids reference the same Phase 2 mechanics ids used by
  semantic equations and canvas states.
- Phase 6 should remove or narrow `unknownReactions` after beam content migrates to the generalized
  quantity path.

## Context file updates

- Updated `ARCHITECTURE.md` with the additive Phase 2 model and beam compatibility path.
- Updated `CONTENT_SCHEMA.md` with the new fields and validation expectations.
- Updated `CURRENT_STATE.md` with the partially generalized mechanics model and remaining
  limitations.
- Updated the active M02 TODO to mark the contract-first Phase 2 items completed and leave target
  content expression validation open until target drafts land.
