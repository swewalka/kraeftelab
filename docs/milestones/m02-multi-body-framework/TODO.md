# M02 TODO

This file owns task tracking for the active M02 Multi-Body Framework milestone.

## Explore Mode

- Define and implement real Explore mode behavior for all catalog problems.
- Specify which variables can be changed for each problem and whether changes are numeric,
  logical, or both.
- Keep numeric and parameter-variation display separate from symbolic Solve and Practice flows.
- Add Explore mode to the two existing beam problems.
- Add Explore mode to the two new M02 problems.

## Semantic Equations And Practice Validation

- Introduce a minimum semantic equation model with equation purpose, sides, terms, factors, signs,
  units, and referenced mechanics ids.
- Use the semantic equation model to connect solver output, Solve display, Practice expected
  answers, and Explore-derived values.
- Add a small symbolic normalizer only as far as needed for M02 beginner statics expressions.
- Decouple feedback ids from fragile validator implementation details where M02 touches validation.
- Support fixed authored solution paths for M02; fully alternative solution strategies remain
  future work unless a narrow alternative is needed for correctness.

## Mechanics Domain Model

- Introduce a more general physical entity model for bodies, forces, supports, contact forces,
  moments, lines of action, joints, ropes/cables, and free-body extraction.
- Model coordinate systems and sign conventions explicitly enough for non-beam planar equilibrium.
- Extend beyond the current one-beam, one-point-load, three-reaction solver workflow.
- Support multiple bodies in one problem.
- Support joints/hinges, support reactions, rope/cable forces, and belt/contact-style force
  directions.

## Diagrams And Canvas

- Generalize the diagram and canvas framework so it is no longer tied to one straight beam renderer.
- Support non-beam rigid-body diagrams for the M02 target problems.
- Add visual regression checks for representative Solve, Practice, and Explore canvas states.
- Preserve existing beam diagram behavior while shared diagram infrastructure is introduced.

## Target Problems

- Plan and implement the articulated ladder with rope and eccentric load as a polished bilingual
  catalog problem.
- Plan and implement the belt tensioner / idler pulley equilibrium problem as a polished bilingual
  catalog problem.
- Add Solve, Practice, and Explore modes for both new problems.
- Keep the ladder exercise's exact learning steps and practice flow open until they are specified.

## Context Maintenance

- Update `ARCHITECTURE.md` when mechanics model, solver contracts, diagram contracts, or Explore
  architecture change.
- Update `CONTENT_SCHEMA.md` when problem content, semantic equations, canvas state, or Explore
  schema changes.
- Update `PRODUCT_VISION.md` only if product-vision decisions change.
- Write substantial implementation reports in `docs/milestones/m02-multi-body-framework/reports/`.
