# KraefteLab Architecture

## Content registration

Problem folders export localized `en` and `de` content through `parseLoadedProblemContent`.
Parsing validates the generic problem shape, force-decomposition contracts, typed solver config,
solution equation ids, solution/practice canvas state, practice component references, and diagram
keys before the content reaches the app.

`src/content/problems/catalog.ts` registers localized problem pairs and runs strict mechanics
alignment checks between English and German. Locale validation compares ids, numeric mechanics
data, solver config, force decompositions, expected practice semantics, and canvas object ids. It
intentionally ignores localized teaching prose and layout-only diagram offsets.

## Mechanics model and solvers

Core mechanics data lives under `src/mechanics/model` and reusable calculations live under
`src/mechanics/core`.

Force decompositions are mechanics contracts on the problem definition. A decomposition names the
source force, magnitude and angle parameters, angle reference, and signed x/y component
expressions. Solvers, practice semantics, and diagrams should reference decomposition/component ids
instead of duplicating trigonometric facts.

Solver config is typed at registration time. The current beam reaction solver uses the
`simply-supported-beam-reactions` config, which references the load id, optional force
decomposition id, beam length/load magnitude/load position parameters, reaction ids, and generated
equation ids. Solvers should consume typed config only; they should not parse raw JSON.

Solve and Practice modes present symbolic variable-based mechanics. Solver-generated equation
content consumed by Solve mode must remain symbolic and must not substitute numeric parameter
values. Numeric parameter values and formatted numeric results are reserved for Explore-mode
behavior.

## UI and diagrams

React components render already-parsed content and solver results. They should not contain curated
mechanics solution facts.

The beam diagram renderer remains beam-specific, but its decomposition overlay labels can now be
resolved from force component ids. Diagram files still own drawing offsets, colors, and visibility
ids.

Solve and Practice mode share the same neutral canvas-state contract for visible objects,
highlights, dimming, solved objects, and solved value labels. Solve mode consumes authored
per-solution-step canvas state directly. Practice mode builds its canvas state from the active
practice step plus completed-step success results; interaction, validation, hints, and accumulated
progress remain practice-specific.
