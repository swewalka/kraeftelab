# M02 Phase 0 Problem Specs

## Task summary

Extracted durable Phase 0 mechanics specs for the two M02 target problems from the PDF and extracted
figure resources.

## Changed files

- `docs/milestones/m02-multi-body-framework/phase-0-articulated-ladder-spec.md`
- `docs/milestones/m02-multi-body-framework/phase-0-belt-tensioner-idler-spec.md`
- `docs/milestones/m02-multi-body-framework/TODO.md`
- `docs/milestones/m02-multi-body-framework/reports/2026-05-18-2108-phase-0-problem-specs.md`

## Implementation decisions

- Created one durable spec file per target problem instead of mixing both into a report-only note.
- Used `m2-mechanical-problems.pdf` as the canonical source and the extracted PNGs as figure
  references.
- Captured computational equations and final values from the PDF solutions for later semantic
  equation, solver, Practice, and Explore validation.
- Explicitly excluded the Spannrolle graphical solution and `mu_F` force scale from app
  implementation source material.
- Chose target ids, folder names, localized titles, and catalog order for the future catalog
  entries.
- Defined first-pass learning sequences, free-body diagram expectations, and Explore controls for
  the target problems.
- Captured first-pass Explore baseline behavior for the two existing beam problems.
- Kept ladder Explore controls to `lambda` and `F_L`; `a` and `h` remain fixed defaults.
- Required ladder Explore to warn that negative vertical reactions mean lift-off and no equilibrium
  under the assumed unilateral support/contact model.

## Verification performed

- Read root context files, active milestone docs, and current architecture/schema notes.
- Rendered the image-based PDF pages and visually extracted the source statements and computational
  solutions.
- Inspected the extracted ladder and belt/idler PNG references.
- Ran `git diff --check`.

## What works

- Phase 0 now has durable written mechanics specs for both M02 target problems.
- The specs name the intended reusable M02 modeling concepts before implementation starts.
- Final unknowns, sign conventions, force directions, requested results, learning sequences, and
  first-pass Explore behavior are documented.

## Fragile or questionable

- Ladder numeric defaults are app defaults, not source-given values.
- Final schema names may still change in Phases 1 and 2 when the semantic equation and planar
  mechanics contracts are implemented.
- Diagram object ids are described by role, not final validated ids.

## Future recommendations

- Start Phase 1 from the equations and quantity roles in these specs.
- Keep Solve and Practice symbolic; use numeric defaults only for Explore and validation.
- Revisit the specs only if Phase 1 or Phase 2 exposes a concrete mismatch in the planned reusable
  model concepts.

## Context file updates

- Updated the active M02 TODO to mark Phase 0 complete.
- Did not update root architecture/schema/current-state files because no implementation contract
  changed yet.
