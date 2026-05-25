# KraefteLab Current State

This document describes the current implementation state. It is not the finished product vision.
Current architecture, schemas, and UI patterns are provisional and may change when the active
milestone requires a cleaner path toward `PRODUCT_VISION.md`.

## Implemented Product Surface

- The app opens on a catalog landing page.
- German (`de`) and English (`en`) content are supported; German is the default.
- The catalog currently contains two statics equilibrium beam problems:
  - simply supported beam with a center point load
  - simply supported beam with an angled off-center point load
- The single-problem workspace has three modes:
  - Explain/Solve
  - Practice
  - Explore

## Current Mode Behavior

- Explain/Solve presents symbolic, authored solution steps.
- Practice presents guided interactive checks using the existing practice runner.
- Explore currently shows the problem overview and static notices. It does not yet provide real
  interactive parameter variation.
- Numeric parameter values exist in problem definitions for validation and future Explore behavior,
  but Solve and Practice should stay symbolic.

## Current Technical Shape

- Problem content is localized JSON under `src/content/problems`.
- `src/content/problems/catalog.ts` registers localized problem pairs, runs German/English
  mechanics-alignment checks, and executes internal mechanics contract checks during module
  loading.
- Core mechanics types live under `src/mechanics/model`; reusable calculations live under
  `src/mechanics/core`.
- Authored semantic equations live in problem definitions and are parsed through
  `src/mechanics/semantic`. The two existing beam problems now expose semantic equilibrium and
  derived-result equations.
- The Phase 2 planar mechanics content contract is partially implemented as an additive schema:
  explicit coordinate system defaults, `dimensionless` parameters, `rigidBody` geometry references,
  generic `quantities`, `freeBodyScopes`, `joints`, `ropes`, and `forceActions`.
- Registered solvers are:
  - `simply-supported-beam-reactions`, which remains the deprecated beam compatibility solver for
    the two existing catalog problems
  - `planar-equilibrium`, a generic linear equilibrium solver for authored free-body equation
    systems
- Beam solver migration is deferred to M02 Phase 6. Phases 3-5 should keep it as deprecated
  compatibility while the generic planar solver, diagram, and Explore contracts stabilize.
- Internal non-catalog contract fixtures validate the generic solver against the M02 articulated
  ladder and belt/idler equation systems from Phase 0.
- The only registered diagram renderer is the beam diagram renderer.
- Canvas state uses authored `visibleObjects`, optional `hiddenBaseObjects`, and annotations.
- Registration-time validation checks solver config, force decomposition contracts, diagram
  references, semantic equation references, generic planar solver linear solvability, Practice
  semantic equation/term references, locale alignment, and authored canvas object ids.

## Current Limitations

- The mechanics model is only partly generalized:
  - content can now declare non-beam rigid bodies, scopes, joints, ropes, and force actions
  - the existing catalog content still uses the beam compatibility path
  - support kinds are still limited to pin and roller
  - loads are still limited to point forces
- The public catalog still uses the beam compatibility solver; generic planar solving is currently
  proven through internal fixtures rather than catalog content.
- The current diagram framework is still centered on a straight beam renderer.
- Practice expression input is not symbolic algebra; it depends on normalized strings and accepted
  expressions.
- The semantic equation model is intentionally minimal and the generic solver only supports linear
  statically determinate equilibrium equations. It is not a CAS and derived-result equations are
  residual checks, not formula-driven solve steps.
- There is no real interactive Explore mode yet.
- There is no freeform workspace, user authoring flow, backend, accounts, or persistence.

## Active Direction

The active milestone is `docs/milestones/m02-multi-body-framework/`. It is expected to change this
current state significantly by generalizing mechanics, solver, diagram, canvas, semantic equation,
and Explore infrastructure for planar multi-body and non-beam statics problems.
