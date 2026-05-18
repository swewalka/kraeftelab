# Typed Solver Config and Force Decomposition Report

Date/time: 2026-05-10 23:38 Europe/Vienna

## Task summary

Implemented typed beam solver config parsing at content registration time, added a reusable
force-decomposition contract, and added strict English/German mechanics-content validation.

Deferred by design: per-solution-step canvas state and symbolic expression equivalence.

## Changed files

- `src/mechanics/model/*`: added typed solver config and force decomposition model fields.
- `src/mechanics/core/forceDecomposition.ts`: added decomposition resolution and vector consistency checks.
- `src/mechanics/solvers/*`: moved solver config parsing/validation out of the beam solver.
- `src/content/problems/parsing.ts`: parses force decompositions and typed solver config.
- `src/content/problems/localeValidation.ts`: compares mechanics-critical structure across locales.
- `src/components/diagram/BeamDiagramLayer.tsx`: allows overlay labels to come from component ids.
- Beam problem JSON files: added `loadId`, force decomposition data, component ids in practice semantics, and component-driven diagram overlays.
- `ARCHITECTURE.md` and `CONTENT_SCHEMA.md`: documented the new boundaries and schema.

## Implementation decisions

Solver config is now required and typed on `ProblemDefinition`. The parser fails during content
loading if solver config references missing ids, wrong parameter units, unsupported solver keys, or
solution equations that do not exist.

Force decomposition is declared once in problem content. The current contract supports the app's
existing 2D statics convention: positive x right, positive y upward, and angle measured from the
positive x-axis. The helper resolves signed components and checks that the stored point-force vector
matches the declaration.

Practice equation-builder semantics can now reference component ids. Validation checks that the
referenced component exists and that nonzero factors include the component factor. Expression input
validation was intentionally left unchanged.

Locale validation compares mechanics-critical snapshots and ignores localized prose and layout-only
diagram offsets. This catches id/value drift without forcing German and English copy to be identical.

## Verification performed

- `npm run typecheck`
- `npm run build`

The production build completed successfully, which also evaluates the problem catalog and strict
localized content registration.

## What works

Both existing beam problems register with typed solver configs. The center-load problem works
without force decomposition. The angled-load problem now has a single decomposition source used by
solver logic, practice semantics, and diagram overlay labels.

## Fragile or questionable

The force-decomposition factor model is still a small string contract, not a symbolic expression
tree. It is enough for `sin(alpha)` and `cos(alpha)` in the current beam examples but should not be
treated as a general algebra layer.

The beam solver remains specialized: one beam, one point load, three reactions, and a fixed
equation strategy.

Locale validation reports a single mismatch error instead of a detailed diff. This is acceptable for
now but will be less ergonomic as content grows.

## Future recommendations

Add a semantic equation model before expanding to many alternative solution paths. Add a small
symbolic normalizer before relying on expression-input answers for broader algebra. Add more precise
locale-validation diagnostics once the content library grows.

## Context file updates

Checked `AGENTS.md`, `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `DESIGN.md`, and the previous report
`2026-05-09-1801-angled-beam-framework-test.md`.

Updated `ARCHITECTURE.md` and `CONTENT_SCHEMA.md` because this task changed content registration,
solver config contracts, force-decomposition schema, diagram overlay behavior, and bilingual
validation rules.

`DESIGN.md` did not need changes because no visual design convention changed.
