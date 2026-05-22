# M02 Phase 1 Semantic Equation Foundation

## Task summary

Implemented the Phase 1 semantic equation foundation using the hybrid decision: authored semantic
equations are the mechanics source of truth, solver config consumes their ids, and registration plus
runtime checks validate references and residuals.

## Changed files

- Added `src/mechanics/semantic/` for semantic equation types, expression parsing/rendering, numeric
  evaluation, residual checks, and content parsing helpers.
- Updated problem parsing, locale validation, model types, solver result types, and Practice
  validation to consume semantic equations and term ids.
- Migrated the two existing beam problems in English and German to authored semantic equilibrium
  and derived-result equations.
- Updated `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `CURRENT_STATE.md`, and the active M02 TODO.

## Implementation decisions

- Stored `semanticEquations` in each localized `problem.*.json` file as mechanics-critical data.
- Kept localized solution files as title/explanation containers; solution equation ids now must
  reference problem semantic equations.
- Kept the current beam solver as a compatibility solver, but changed its displayed equations to
  come from semantic equations and added `quantities` to solver results.
- Added residual assertions for all semantic equations evaluated by the beam solver.
- Added the intentionally small expression subset needed for M02 statics: variables, constants,
  unary signs, sums, products, ratios, parentheses, and `sin`/`cos`.
- Let Practice equation-builder steps use `expectedSemanticEquation` with semantic term ids while
  still supporting explicit distractor terms.
- Added stable Practice mistake ids for semantic terms, while preserving legacy ids for remaining
  non-semantic distractors.
- Added optional `explore.observedQuantityIds` validation as a placeholder for future Explore
  observations.

## Verification performed

- Ran `npm run typecheck`.
- Ran `npm run build`.
- The production build executed content registration for both locales and both beam problems,
  including semantic equation parsing, locale alignment, Practice semantic references, and solver
  residual assertions.

## What works

- Both existing beam problems still register, solve, build, and expose their Solve equations through
  semantic equations.
- Practice equation-builder expected answers now reference semantic equation and term ids.
- Derived result equations are available for the existing beam reaction quantities.
- Missing semantic equation, term, quantity, parameter, component, body, point, or mechanics-object
  references fail during parsing/registration where those references are declared.

## Fragile or questionable

- The expression layer is intentionally small and is not symbolic algebra or expression
  equivalence.
- Practice factor generation currently derives validator factors from rendered LaTeX. This is known
  to break at least `beamLength/2`, which renders as `\frac{L}{2}` and sanitizes to `fracL2`
  instead of the existing practice factor `L/2`; the center-load moment-equation Practice step can
  reject the otherwise correct `F \cdot L/2` term until factor generation uses a plain
  machine-readable renderer or equivalent normalization.
- The beam solver still owns numeric reaction solving; generic planar equilibrium is deferred to
  later M02 phases.
- Some Practice distractor feedback still uses legacy ids for zero/extra terms that are not actual
  semantic equation terms.
- Manual browser passes were not automated; the build validates registration and rendering
  compilation, but not interactive visual behavior.

## Future recommendations

- In Phase 2 and Phase 3, reuse the semantic equation shape instead of introducing solver-specific
  formula formats.
- When real Explore lands, connect observations to `observedQuantityIds` and semantic derived
  equations rather than duplicating formulas in UI code.
- Consider adding dedicated unit tests for the expression parser/evaluator once the generic planar
  solver starts relying on it.

## Context file updates

- Updated `ARCHITECTURE.md` with semantic equation ownership, solver behavior, and Practice term
  references.
- Updated `CONTENT_SCHEMA.md` with semantic equation, Practice semantic reference, and Explore
  observed quantity placeholder schema.
- Updated `CURRENT_STATE.md` to reflect the implemented semantic equation layer and remaining
  beam-solver limitation.
- Updated `docs/milestones/m02-multi-body-framework/TODO.md` to mark Phase 1 complete and record
  the semantic equation shape decision.
