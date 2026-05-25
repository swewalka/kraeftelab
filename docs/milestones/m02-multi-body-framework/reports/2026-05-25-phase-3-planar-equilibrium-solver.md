# M02 Phase 3 Planar Equilibrium Solver

## Task summary

Implemented the first Phase 3 solver architecture slice. Existing beam catalog problems remain on
the deprecated compatibility solver, while the new `planar-equilibrium` solver is validated against
internal draft equation fixtures for the articulated ladder and belt/idler target problems.

## Changed files

- `src/mechanics/core/linearSystem.ts`
- `src/mechanics/model/solverConfig.ts`
- `src/mechanics/semantic/types.ts`
- `src/mechanics/semantic/parsing.ts`
- `src/mechanics/solvers/solverConfigRegistry.ts`
- `src/mechanics/solvers/solverRegistry.ts`
- `src/mechanics/solvers/equilibrium2D/semanticLinearSystem.ts`
- `src/mechanics/solvers/equilibrium2D/planarEquilibriumValidation.ts`
- `src/mechanics/solvers/equilibrium2D/solvePlanarEquilibrium.ts`
- `src/content/problems/parsing.ts`
- `src/content/problems/catalog.ts`
- `src/content/problems/contractChecks.ts`
- `ARCHITECTURE.md`
- `CONTENT_SCHEMA.md`
- `CURRENT_STATE.md`
- `docs/milestones/m02-multi-body-framework/TODO.md`

## Implementation decisions

- Added `planar-equilibrium` as a new solver key without migrating existing beam content.
- Kept `simply-supported-beam-reactions` as the Phase 3-5 deprecated compatibility path.
- Added a generic square linear solver and kept `solveThreeByThree` as a compatibility wrapper.
- Added semantic-equation linearization for the M02 beginner-statics expression subset.
- Required generic solve equations to carry `scopeId` and to be linear equilibrium equations with
  units `N` or `N*m`.
- Treated derived-result equations as residual checks only, not formula-driven solve steps.
- Wired internal mechanics contract checks into catalog module loading so build exercises them.
- Added non-catalog ladder and belt/idler fixtures. They include minimal beam-diagram scaffolding
  only because the current diagram registry is still beam-only before Phase 4.

## Verification performed

- Ran `npm run typecheck`.
- Ran `npm run build`.
- Loaded `src/content/problems/catalog.ts` through Vite SSR to execute existing catalog
  registration, locale validation, Phase 2 contract checks, and Phase 3 solver contract checks.

## What works

- Existing beam catalog problems still build through `simply-supported-beam-reactions`.
- `planar-equilibrium` solves ordered semantic equilibrium equations over ordered unknown
  quantities.
- Ladder fixture solves `F_Ax = 0`, `F_Ay = 300 N`, `F_B = 700 N`, and `F_S = 225 N`.
- Belt/idler fixture solves `F_B = 500 N`, `F_S = 169.1 N`, and `F_G = 438.1 N`.
- Contract checks cover missing equation ids, duplicate unknown ids, equation/unknown count
  mismatch, missing scope ids, nonlinear equations, singular systems, derived-result solve
  equations, and residual mismatches.

## Fragile or questionable

- The generic solver is intentionally linear and not a CAS.
- Internal solver fixtures still need beam-diagram scaffolding until the generic diagram framework
  exists in Phase 4.
- The target problems are not public catalog entries yet; full content, diagrams, Practice, and
  Explore remain Phase 7 work.
- Derived quantities that are not solved unknowns are not computed through dependency ordering yet.

## Future recommendations

- Phase 4 should remove the need for beam-diagram scaffolding in non-beam internal fixtures.
- Phase 5 Explore should consume `SolverResult.quantities` from `planar-equilibrium` rather than
  duplicating formulas in UI components.
- Phase 6 should migrate the existing beam problems only after the diagram and Explore contracts
  have stabilized.

## Context file updates

- Updated `ARCHITECTURE.md` with the generic solver contract.
- Updated `CONTENT_SCHEMA.md` with `planar-equilibrium` solver config and scope-id rules.
- Updated `CURRENT_STATE.md` with the implemented solver state and remaining limitations.
- Updated the active M02 TODO to mark Phase 3 complete.
