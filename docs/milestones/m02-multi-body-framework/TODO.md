# M02 TODO

This file owns task tracking for the active M02 Multi-Body Framework milestone.

M02 is a framework milestone first and a content milestone second. The two new target problems
should drive the architecture, but they should not be implemented as isolated special cases.

## Roadmap Principles

- Keep the two existing beam problems working after every major migration step.
- Use the articulated ladder and belt tensioner/idler pulley specs to validate contracts early,
  before all target-problem content is authored.
- Make semantic equations the shared source for solver output, Solve display, Practice expected
  answers, and Explore-derived values.
- Keep Solve and Practice symbolic and exam-style; keep numeric parameter variation in Explore.
- Prefer a small, typed M02 mechanics and equation core over a broad CAS, simulation engine, or
  freeform authoring workspace.
- Fixed authored solution paths are acceptable for M02, but content should reference reusable
  mechanics ids and semantic equations rather than duplicating formulas across files.

## Phase 0 - Problem Specs And Architecture Baseline

- [x] Capture canonical mechanics specs for the two target problems from the PDF and extracted
  images in `docs/milestones/m02-multi-body-framework/resources/`:
  - articulated ladder with rope and eccentric load
  - belt tensioner / idler pulley equilibrium
- [x] Use `m2-mechanical-problems.pdf` as the durable source for the problem statements and use
  the extracted PNGs as figure references.
- [x] Use the computational solution included for each PDF problem as reference material for
  mechanics checks, semantic equations, solver validation, and numeric expected values.
- [x] Ignore the graphical solution included with the Spannrolle/belt-tensioner material
  completely. It is not app source material and should not drive Solve, Practice, Explore, solver,
  or diagram implementation.
- [x] For each target problem, write down bodies, points, supports/contacts, joints, ropes/cables,
  belt/contact force directions, known parameters, unknown quantities, sign conventions, and final
  requested results.
- [x] Decide target problem ids, folder names, localized titles, and catalog placement.
- [x] Specify the ladder learning sequence before implementation. At minimum, decide the intended
  free-body diagrams, where the hinge/rope forces appear, which moment points are taught, and which
  quantities Practice asks students to derive.
- [x] Specify the belt tensioner/idler learning sequence before implementation. At minimum, decide
  how belt/contact force directions are introduced, which body is isolated, and which reactions or
  tensions are final answers.
- [x] Define first-pass Explore controls and observed quantities for all four catalog problems:
  center-load beam, angled-load beam, ladder, and belt/idler.

Exit criteria:

- [x] A short problem-spec note or report exists for M02 target mechanics.
- [x] The target specs are representable on paper using planned reusable model concepts.
- [x] No target problem implementation starts with unresolved final unknowns or ambiguous force
  directions.

## Phase 1 - Semantic Equation Foundation

- [x] Introduce a minimum semantic equation model with:
  - equation id and purpose (`sumForceX`, `sumForceY`, `sumMoment`, derived result)
  - free-body/body scope
  - optional moment point
  - left and right sides
  - terms with signs, factors, units, quantity ids, parameter ids, and mechanics object ids
  - symbolic display generated from structured data where practical
- [x] Add a small expression representation and normalizer for M02 beginner statics expressions.
  Scope should cover variables, numeric constants, unary signs, sums, products, ratios, parentheses,
  and `sin`/`cos` of angle parameters. Do not build a general CAS.
- [x] Add numeric evaluation for semantic expressions using problem parameters and solved
  quantities, so Explore can reuse the same equations.
- [x] Change solver results from beam-specific reaction arrays plus string equations toward a
  semantic result shape containing quantities, equations, and evaluated values.
- [x] Keep a compatibility adapter for existing beam rendering/content while migration is in
  progress.
- [x] Migrate Practice equation-builder expected answers from fragile string/factor matching toward
  semantic equation or semantic term references.
- [x] Decouple authored feedback ids from validator implementation details such as normalized
  factor strings.
- [x] Validate that solution equation ids, Practice expected equations, and Explore observed
  quantities reference registered semantic equations or quantities.
- [x] Update `ARCHITECTURE.md` and `CONTENT_SCHEMA.md` when the semantic equation contract lands.

Exit criteria:

- [x] Both existing beam problems still solve, render, and validate Practice answers.
- [x] Existing beam solution equations are available as semantic equations, not only display
  strings.
- [x] Registration fails when content references missing semantic equation, term, quantity, or
  mechanics ids.

## Phase 2 - Planar Mechanics Domain Model

- [x] Expand the model beyond `rigidBeam` into reusable planar entities:
  - rigid bodies with authored geometry references
  - points and attachment points
  - supports and support reactions
  - joints/hinges with action-reaction force pairs
  - ropes/cables with shared tension and authored line of action
  - belt/contact-style tangential forces
  - point forces and narrow couple/moment support if required by the target problems
- [x] Model coordinate systems and sign conventions explicitly enough for non-beam equilibrium:
  positive x, positive y, positive moment direction, and angle references.
- [x] Represent free-body scopes: whole system, individual body, or authored body group.
- [x] Represent internal/external force ownership so a hinge or rope force can appear correctly on
  different free-body diagrams.
- [x] Extend parameter/unit support only as needed for M02, including moment equation units and
  angle/length/force formatting.
- [x] Update parsing and locale validation for the expanded mechanics schema.
- [x] Update canvas object id collection so bodies, joints, ropes, contact forces, reactions,
  semantic quantities, and renderer objects can all be validated consistently.
- [x] Migrate existing beam content to the generalized schema or provide a clearly documented
  compatibility path with a removal plan.

Phase 2 contract-first slice note: existing beam content remains on the compatibility path. Final
confidence against the exact ladder and belt/idler authored problem files will come when target
draft content is introduced in later phases.

Exit criteria:

- [x] The existing beam problems and both target problem specs can be expressed with the same
  mechanics model.
- [x] The model does not require target-problem-only fields for ladder hinges, rope tension, pulley
  contacts, or belt directions.

## Phase 3 - Equilibrium Solver Architecture

- [x] Implement a generic planar equilibrium solver recipe for authored free-body scopes:
  `sumForceX`, `sumForceY`, and `sumMoment` equations over declared unknown quantities.
- [x] Replace the current fixed `solveThreeByThree` limitation with a small generic linear solver
  for the statically determinate M02 systems.
- [x] Allow solver configs to declare equation order, unknown order, selected free-body scopes, and
  derived quantities without embedding curated teaching prose in solver code.
- [x] Generate or validate semantic equations from solver configs so solver output, Solve,
  Practice, and Explore share ids.
- [x] Keep symbolic output variable-based. Numeric substitutions belong to Explore and checks.
- [x] Validate solver configs at registration time with useful errors for missing ids, wrong units,
  singular systems, unsupported force directions, or inconsistent body scopes.
- [x] Decide whether the old beam solver becomes a thin adapter over the planar equilibrium solver
  or remains as a deprecated compatibility solver until M02 closes.

Decision: keep `simply-supported-beam-reactions` as a deprecated compatibility solver through
Phases 3-5. Phase 3 should build the generic planar equilibrium solver for new M02-compatible
solver configs and validate it against draft ladder and belt/idler equation sets. Do not migrate
the existing beam solver/config in Phase 3 unless a narrow compatibility hook is required to keep
the catalog working. Full beam migration is owned by Phase 6.

Exit criteria:

- [x] Existing beam reactions still pass through the deprecated compatibility solver, with the
  deprecation and Phase 6 migration path documented.
- [x] Draft ladder and belt/idler equation sets can be solved numerically by the generic planar
  solver from their authored mechanics data.
- [x] Solver results expose all values needed by Solve final formulas, Practice checks, Explore
  observations, and diagram labels for generic planar solver configs.

## Phase 4 - Diagram And Canvas Framework

- [ ] Introduce a renderer-agnostic diagram scene schema for planar statics diagrams:
  - line segments, polylines, polygons, and discs
  - supports, hinges, joints, and pins
  - rope/cable paths
  - belt/contact tangent arrows and optional pulley arcs
  - force/reaction arrows, dimensions, angle markers, labels, and callouts
- [ ] Keep reusable Konva primitives for arrows, dimensions, angles, labels, support symbols, and
  selection hit targets.
- [ ] Add a generic planar diagram adapter while preserving the current beam diagram behavior.
- [ ] Keep existing beam diagrams on the beam renderer compatibility path until Phase 6; Phase 4
  should not migrate beam content unless required for regression safety.
- [ ] Let canvas state select authored view/free-body context when needed, then use
  `visibleObjects` and `hiddenBaseObjects` for step-specific teaching visibility.
- [ ] Ensure diagram object ids can reference mechanics ids and semantic quantity ids without
  duplicating labels or formulas in React components.
- [ ] Support representative non-beam views for the target problems: full setup and one or more
  free-body diagrams.
- [ ] Manually review representative Solve, Practice, and Explore canvas states for all catalog
  problems before closing M02.

Exit criteria:

- [ ] Beam diagrams remain visually equivalent on the compatibility renderer while the generic
  planar renderer is introduced for M02 target diagrams.
- [ ] Ladder and belt/idler diagrams can be authored without custom one-off React renderers.
- [ ] Registration catches missing diagram references before the app renders.

## Phase 5 - Explore Mode Framework

- [ ] Replace the current static Explore notices with real interactive controls and observed
  results.
- [ ] Add an Explore schema for controls:
  - numeric parameter sliders or steppers with min/max/step/unit formatting
  - narrow enum/toggle controls only where needed by M02
  - localized labels and short observations
  - constraints that prevent invalid statics setups
- [ ] Build an Explore state path that clones or derives problem parameters, reruns the semantic
  solver, and updates numeric observations and diagram geometry/forces.
- [ ] Keep Explore equation/result display separate from symbolic Solve and Practice panels.
- [ ] Define the Explore framework against semantic equations and solver outputs without requiring
  immediate beam content migration; the existing beam problems may keep their compatibility solver
  until Phase 6.
- [ ] Optionally use a beam Explore prototype only if it does not force early migration of beam
  solver, diagram, or content contracts.
- [ ] Implement Explore for ladder and belt/idler after their solver and diagram contracts are
  stable.
- [ ] Add locale validation for mechanics-critical Explore controls and observed quantity ids.

Exit criteria:

- [ ] The Explore framework is ready for Phase 6 beam migration and can consume semantic solver
  outputs for generic planar configs.
- [ ] Explore values come from the semantic solver/equation layer, not duplicated formulas in UI
  components.
- [ ] Invalid parameter combinations are prevented or reported in the Explore schema.

## Phase 6 - Existing Beam Migration And Regression

- [ ] Migrate the existing beam problems from the deprecated compatibility solver path to the final
  M02 solver/config path, or document any intentionally retained adapter as temporary closure debt.
- [ ] Convert the center-load beam content to the final M02 semantic equation, diagram, Practice,
  and Explore contracts.
- [ ] Convert the angled-load beam content to the final M02 semantic equation, diagram, Practice,
  and Explore contracts.
- [ ] Remove obsolete beam-only schema fields once both beam problems use the generalized path, or
  document any remaining compatibility layer as intentionally temporary.
- [ ] Preserve German/English mechanics alignment for both beam problems.
- [ ] Verify final-result math block treatment remains reserved for final answers.
- [ ] Run typecheck/build and content registration after each migration step.

Exit criteria:

- [ ] The two M01 beam problems meet M02 acceptance criteria: Solve, Practice, real Explore,
  semantic equations, validated canvas states, and no hidden beam-only solver assumptions.
- [ ] `simply-supported-beam-reactions` is either removed or explicitly documented as a temporary
  compatibility layer with no hidden ownership of M02 target behavior.

## Phase 7 - Target Problem Implementation

### Articulated Ladder

- [ ] Create bilingual problem, solution, practice, diagram, and Explore content files.
- [ ] Model ladder bodies, hinge/joint forces, rope/cable tension, support/contact reactions, load
  position, and eccentricity using the generalized mechanics schema.
- [ ] Author full setup and free-body diagram views.
- [ ] Implement Solve steps that teach the intended equilibrium strategy without relying on hidden
  one-off solver facts.
- [ ] Implement Practice steps for:
  - identifying bodies and connections
  - identifying external and internal forces on the chosen free-body diagrams
  - choosing useful moment points or equilibrium equations
  - building semantic equations
  - deriving the requested final quantities
- [ ] Implement Explore controls and observations defined in Phase 0.
- [ ] Polish German terminology for HTL/TU-level statics learners.

### Belt Tensioner / Idler Pulley

- [ ] Create bilingual problem, solution, practice, diagram, and Explore content files.
- [ ] Model the pulley/idler body, belt/contact force directions, known tensions or force ratios,
  bearing/support reactions, and any relevant arm/geometry constraints using the generalized
  mechanics schema.
- [ ] Author full setup and free-body diagram views with clear tangent/contact force directions.
- [ ] Implement Solve steps that emphasize force directions and equilibrium of the isolated body.
- [ ] Implement Practice steps for:
  - recognizing belt/contact force directions
  - selecting the correct isolated body or free-body diagram
  - assembling vector equilibrium terms
  - solving requested reactions or tensions
  - checking sign and direction interpretation
- [ ] Implement Explore controls and observations defined in Phase 0.
- [ ] Polish German terminology and ensure mechanics-critical ids stay locale-aligned.

Exit criteria:

- [ ] Both target problems are catalog entries in German and English.
- [ ] Both target problems have Explain/Solve, Practice, and real Explore modes.
- [ ] Their solvers, diagrams, and checks use the shared M02 framework rather than one-off
  problem-specific React or validator logic.

## Phase 8 - Hardening, Documentation, And Closure

- [ ] Add or update automated checks for:
  - TypeScript typecheck/build
  - content registration and locale alignment
  - semantic equation references
  - diagram/canvas object references
- [ ] Run final manual passes through all catalog problems in German and English.
- [ ] Update `ARCHITECTURE.md` with final mechanics model, solver, diagram, canvas, Practice, and
  Explore contracts.
- [ ] Update `CONTENT_SCHEMA.md` with final content, semantic equation, canvas, diagram, and
  Explore schemas.
- [ ] Update `CURRENT_STATE.md` to reflect implemented M02 behavior and remaining limitations.
- [ ] Update `PRODUCT_VISION.md` only if product-vision decisions changed.
- [ ] Update root `TODO.md` and this file by removing completed M02-owned items and moving
  deferred work to the correct future backlog.
- [ ] Write substantial implementation reports in
  `docs/milestones/m02-multi-body-framework/reports/`.
- [ ] Close or revise the M02 README status when acceptance criteria are met or scope changes.

Exit criteria:

- [ ] M02 README acceptance criteria are satisfied.
- [ ] Remaining fragile areas are documented as explicit limitations rather than hidden debt.

## Architecture Decisions To Make Early

- [x] Final shape of semantic equations: whether authored equations are source of truth, generated
  from solver config, or a hybrid with validation both ways.
- [ ] Diagram migration path: generic planar diagram scene immediately, or beam adapter plus generic
  scene in parallel until target diagrams land.
- [x] Solver migration path: beam solver adapter over generic equilibrium solver, or deprecated beam
  solver kept only until existing content migration completes.
  - Decision: keep the beam solver deprecated and compatible through Phases 3-5; migrate or retire
    it in Phase 6.
- [ ] Explore control scope: numeric-only for first implementation, with logical toggles deferred
  unless the target problems require them.

## Known Fragile Areas To Track

- Expression equivalence must stay intentionally small; avoid pretending it is a full symbolic
  algebra system.
- Locale validation currently reports broad mismatches. M02 content growth may require path-level
  diagnostics.
- Reference files are stored in the M02 `resources/` folder, but target problem specs still need a
  durable written extraction before implementation.
- Both PDF problems include computational solutions that should be used as reference material for
  mechanics and numeric checks.
- The Spannrolle/belt-tensioner PDF material contains a graphical solution that must be ignored
  completely.
- Diagram layout offsets can become hidden mechanics facts. Keep physical quantities in mechanics
  data and visual placement in diagram config.
- Practice feedback should describe student-facing mistakes, not validator internals.
