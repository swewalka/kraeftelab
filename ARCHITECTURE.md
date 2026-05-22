# KraefteLab Architecture

## Content registration

Problem folders export localized `en` and `de` content through `parseLoadedProblemContent`.
Parsing validates the generic problem shape, force-decomposition contracts, semantic equations,
typed solver config, solution equation ids, solution/practice canvas state, practice component and
semantic references, diagram keys, diagram config references, and canvas object ids before the
content reaches the app.

`src/content/problems/catalog.ts` registers localized problem pairs and runs strict mechanics
alignment checks between English and German. Locale validation compares ids, numeric mechanics
data, semantic equations, solver config, force decompositions, expected practice semantics, Explore
observed quantity ids, and canvas object ids. It intentionally ignores localized teaching prose and
layout-only diagram offsets.

## Mechanics model and solvers

Core mechanics data lives under `src/mechanics/model` and reusable calculations live under
`src/mechanics/core`.

Force decompositions are mechanics contracts on the problem definition. A decomposition names the
source force, magnitude and angle parameters, angle reference, and signed x/y component
expressions. Solvers, practice semantics, and diagrams should reference decomposition/component ids
instead of duplicating trigonometric facts.

Semantic equations are authored mechanics contracts on the problem definition. They are the shared
source for solver equation display, Practice equation-builder expectations, and future Explore
numeric observations. Each semantic equation has an id, purpose, free-body scope, unit, optional
moment point, and structured left/right sides. Equilibrium equations use stable term ids that
reference quantities, parameters, force-decomposition components, and mechanics objects. Derived
result equations connect solved quantities to symbolic formulas. Localized solution files keep only
equation titles and teaching explanations; their equation ids must reference semantic equations
from the problem definition.

Solver config is typed at registration time. The current beam reaction solver uses the
`simply-supported-beam-reactions` config, which references the load id, optional force
decomposition id, beam length/load magnitude/load position parameters, reaction ids, and generated
equation ids. Solver configs consume semantic equation ids; they do not generate the teaching
equations. Solvers should consume typed config only; they should not parse raw JSON.

Solve and Practice modes present symbolic variable-based mechanics. Solver equation content
consumed by Solve mode is rendered from semantic equations and must not substitute numeric
parameter values. Numeric parameter values and formatted numeric results are reserved for
Explore-mode behavior.

## UI and diagrams

React components render already-parsed content and solver results. They should not contain curated
mechanics solution facts.

The app opens on a simple catalog landing page built from `problemCatalog`. It groups problems by
the structured problem `topic`, shows localized problem metadata from content, and then hands the
selected problem id to the existing single-problem learning workspace. There is intentionally no
separate routing layer yet.

The beam diagram renderer remains beam-specific, but shared diagram overlay helpers own reusable
force-arrow, component-arrow, angle-marker, label, dimension, and visibility styling.
Beam diagram files still own beam-specific placement offsets and visibility ids. Decomposition
overlay labels are resolved from force component ids. Beam diagram config parsing and object-id
collection live in a pure mechanics diagram module so registration-time content validation can use
the same renderer object contract without depending on React components.

Solve and Practice mode share the same neutral canvas-state contract. Renderers may define a small,
stable set of base context objects that are visible by default; the current beam renderer's base set
is the beam body plus endpoint markers/labels for A and B. Authored `visibleObjects` controls
step-specific teaching objects such as supports, loads, reactions, component arrows, dimensions,
angle markers, and other overlays. `hiddenBaseObjects` is an optional escape hatch for hiding base
objects. Solve mode consumes authored per-solution-step canvas state directly. Practice mode builds
its canvas state from the active practice step plus completed-step `revealObjects`; interaction,
validation, hints, and accumulated progress remain practice-specific. Diagram focus is binary:
authored objects are visible at normal opacity or not rendered.
At content registration, authored `visibleObjects` and `revealObjects` ids must match known problem
object ids, reaction ids, force-decomposition component ids, or renderer object ids. Authored
`hiddenBaseObjects` ids must match renderer base object ids.

Practice equation-builder interactions may reference semantic equation and term ids through
`expectedSemanticEquation`. The parser resolves those ids into the current UI-compatible expected
terms using a plain machine-readable semantic expression renderer, not display LaTeX. Validator
factors therefore use stable ASCII practice labels such as `L/2` and `sin(alpha)*a` while UI labels
may keep rendered LaTeX. Registration checks that every semantic expected term has a matching
available selectable term with the same semantic ids, sign, component id, and normalized factor.
Validation reports stable mistake ids such as `missingTerm:<termId>`, `wrongSign:<termId>`, and
`wrongFactor:<termId>`. Legacy explicit term semantics remain available for distractors while M02
migration is in progress.
