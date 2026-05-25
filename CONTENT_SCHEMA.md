# Problem Content Schema

Problem content is localized, but mechanics-critical ids and numeric data must match between
`de` and `en`.

## Problem definition

Required top-level problem fields:
- `id`, `title`, `topic`, `problemType`, `solverKey`, `diagramKey`, `statement`
- `parameters`, `points`, `bodies`, `supports`, `loads`, `unknownReactions`
- `semanticEquations`
- `solverConfig`

Optional top-level problem fields:
- `coordinateSystem`
- `forceDecompositions`
- `quantities`
- `freeBodyScopes`
- `joints`
- `ropes`
- `forceActions`
- `explore`

Parameter units currently supported by the parser are `dimensionless`, `m`, `N`, `N*m`, and `deg`.

If omitted, `coordinateSystem` defaults to the M02 planar convention:

```json
{
  "positiveX": "right",
  "positiveY": "up",
  "positiveMoment": "counterclockwise",
  "angleUnit": "deg"
}
```

## Phase 2 planar mechanics fields

The Phase 2 fields are additive. Existing beam content may continue to use `rigidBeam`,
`unknownReactions`, `beam-diagram`, and `simply-supported-beam-reactions` until Phase 6 migration.
New M02 target content should use the generalized fields where needed.

Bodies may use the legacy beam shape:

```json
{ "id": "beam", "label": "Beam", "kind": "rigidBeam", "startPointId": "A", "endPointId": "B" }
```

or the generalized body shape:

```json
{
  "id": "idlerPulley",
  "label": "Pulley",
  "kind": "rigidBody",
  "geometry": { "kind": "disc", "centerPointId": "M", "radiusParameterId": "r" }
}
```

Supported `rigidBody.geometry.kind` values are `lineSegment`, `polyline`, and `disc`.

`quantities` define reusable mechanics quantities beyond support reactions. Each quantity defines
`id`, `label`, `unit`, optional `role` (`unknown`, `known`, or `derived`; default `unknown`), and
optional numeric `value`.

`freeBodyScopes` may define `wholeSystem`, `body`, or `bodyGroup` scopes. Semantic equations may
also reference authored scopes with `scopeId` on any scope kind, for example
`{ "kind": "body", "bodyId": "...", "scopeId": "..." }` or
`{ "kind": "bodyGroup", "bodyIds": [...], "scopeId": "..." }`.

`joints` currently support `kind: "hinge"` with `pointId`, connected `bodyIds`, and optional
`quantityIds` for hinge components.

`ropes` currently support `kind: "rope"` with path `pointIds`, related `bodyIds`, and a shared
tension `quantityId`.

`forceActions` describe forces on specific free-body diagrams. Each action defines `id`, `label`,
`kind`, and `ownership` (`external` or `internal`). Optional references include `bodyId`,
`pointId`, `quantityId`, `loadId`, `supportId`, `jointId`, `ropeId`, `component`, `lineOfAction`,
and `oppositeActionId`. `lineOfAction` may be a vector direction or a line between two points.
`oppositeActionId` must reference an existing force action; if the opposite action also declares an
opposite, it must point back.

## Force decompositions

Use `forceDecompositions` when a point force is represented through signed x/y components.

Each decomposition must define:
- `id`
- `forceId`
- `magnitudeParameterId` with unit `N`
- `angleParameterId` with unit `deg`
- `angleReference`: `positive-x`, `negative-x`, `positive-y`, `negative-y`, or
  `authored-line-of-action`
- `components.x` and `components.y`

Each component must define:
- `id`
- `axis`: `x` or `y`
- `sign`: `+` or `-`
- `factor`, for example `cos(alpha)` or `sin(alpha)`
- `expression`, for example `F*cos(alpha)` or `-F*sin(alpha)`
- `latex`, used by diagram overlays when they reference `componentId`

The parser checks that the stored load vector matches the declared decomposition.

## Semantic equations

`semanticEquations` are authored mechanics-critical equations. They are the shared symbolic source
for Solve equation display, Practice expected equation terms, solver residual checks, and future
Explore observations.

Each semantic equation must define:
- `id`
- `purpose`: `sumForceX`, `sumForceY`, `sumMoment`, or `derivedResult`
- `scope`: `{ "kind": "wholeSystem", "scopeId": "..." }`,
  `{ "kind": "body", "bodyId": "...", "scopeId": "..." }`, or
  `{ "kind": "bodyGroup", "bodyIds": [...], "scopeId": "..." }`; `scopeId` is optional in
  general, but required for equations used by the generic planar solver
- `unit`: `dimensionless`, `m`, `N`, `N*m`, or `deg`
- `lhs` and `rhs`, each either an expression string/object or an object with `terms`

`sumMoment` equations must also define `momentPointId`.

Expression strings support the Phase 1 beginner-statics subset: variables, numeric constants,
unary signs, `+`, `-`, `*`, `/`, parentheses, and `sin(...)`/`cos(...)` of angle parameters.
Expression variable names must reference known parameter ids, unknown reaction ids, generic
quantity ids, or force-decomposition component ids.

Equilibrium terms must define:
- `id`
- `sign`: `+` or `-`
- `unit`, matching the parent equation unit
- at least one of `quantityId`, `parameterId`, or `componentId`
- optional `factor`, using the expression subset above
- optional `mechanicsObjectIds`
- optional `latex` display override

`quantityId` may reference a legacy `unknownReaction` or a generic Phase 2 `quantity`.
`mechanicsObjectIds` may reference points, bodies, supports, loads, reactions, generic quantities,
free-body scopes, joints, ropes, force actions, force decompositions, or force-decomposition
component ids. `componentId` is validated against declared force-decomposition component ids.

## Solver config

`solverConfig` is parsed according to `solverKey`. Supported solver keys are
`simply-supported-beam-reactions` and `planar-equilibrium`.

Beam reaction solver config must define:
- `beamLengthParameterId` with unit `m`
- `loadId`
- `loadMagnitudeParameterId` with unit `N`
- `loadPositionParameterId` with unit `m`
- optional `loadDecompositionId`
- `horizontalReactionId`, `leftVerticalReactionId`, `rightVerticalReactionId`
- `equationIds.sumForceX`, `equationIds.sumMomentAboutLeftSupport`, `equationIds.sumForceY`

Generic planar equilibrium solver config must define:
- `equationIds`: ordered semantic `sumForceX`, `sumForceY`, or `sumMoment` equation ids used to
  build the linear system
- `unknownQuantityIds`: ordered unknown reaction or generic quantity ids
- `scopeIds`: authored free-body scope ids selected by the solve recipe
- `checkEquationIds`: semantic equations evaluated after solving, including derived-result checks
- optional `resultQuantityIds`: quantities exposed in solver output; defaults to solved unknowns

For `planar-equilibrium`, `equationIds.length` must equal `unknownQuantityIds.length`.
Solve equations must use units `N` or `N*m`, must not be `derivedResult`, must carry a `scopeId`
included in `scopeIds`, and must be linear in the declared unknowns. Known parameters, known
quantities, and force-decomposition components may appear as constants or coefficients. Products
of unknown-dependent expressions, trigonometric functions of unknowns, division by unknowns, and
singular systems fail registration.

Solver config references are validated during content registration, including equation ids from
the semantic equation list. Solution equation ids must also reference semantic equations.

## Solution content

Solution content is for symbolic guided explanation. It should use variables and symbolic
relationships, not numeric substitutions or numeric result summaries. Numeric parameter values may
remain in problem definitions for mechanics checks and future Explore-mode displays.

Math content blocks may set `tone: "result"` for final answer formulas such as final support
reactions. Use this only for final results, not intermediate equations.

## Canvas state

Solution steps and practice steps may define `canvasState` to drive diagram visibility and
focus.

Canvas state may define:
- `visibleObjects`: authored, step-specific diagram object ids to show
- `hiddenBaseObjects`: optional ids for renderer-defined base objects to hide
- `annotations`

Renderer-defined base objects are visible by default and should be limited to stable context that
does not carry step-specific teaching meaning. In the current beam renderer, base objects always
include the beam body id and the two beam endpoint point ids. Support symbols, external load
arrows, reaction arrows, component arrows, dimensions, angle markers, and other overlays are not
base objects; include them in `visibleObjects` when a Solve or Practice step should show them.

Solution-step canvas states are self-contained. They are not cumulative unless the content repeats
previously revealed objects in the later step.

Practice-step `successResult.revealObjects` may make objects visible after a completed step. Exact
formulas belong in explanation and practice feedback content, not in canvas arrow labels or canvas
state.

`visibleObjects` and `revealObjects` are validated during content registration. Each id must match
a declared problem object id, reaction id, generic quantity id, Phase 2 planar mechanics id,
force-decomposition component id, or renderer diagram object id. `hiddenBaseObjects` is stricter:
each id must match a renderer-defined base object id.

Beam diagram configs may define `angleMarkers` for arc-based angle annotations. Each marker uses a
diagram object id, anchor point id, label, radius, start/end angles in canvas degrees, label offset,
and font size.

Beam diagram configs are also validated at registration time. Point, body, support, load, reaction,
and force-component references in the diagram config must resolve to the parsed problem definition.

## Practice semantics

Equation-builder interactions may define `expectedSemanticEquation` with an `equationId` and
ordered `termIds`. The parser resolves those semantic terms into the current expected-equation
shape used by the Practice UI and validator. Generated validator factors are plain ASCII practice
expressions rendered from semantic expression data, not sanitized LaTeX; for example `beamLength/2`
becomes `L/2` and `sin(loadAngle)*loadPosition` becomes `sin(alpha)*a`.

Equation-builder terms may include `semantic.equationId` and `semantic.termId` when they represent
or intentionally invert an authored semantic term. Terms may also include `semantic.componentId`.
When a component id is present, it must reference a declared force-decomposition component, and the
term factor must include that component's factor unless the term is explicitly a zero factor.
For semantic expected equations, registration also requires a matching available term with the same
semantic ids, sign, component id, and normalized factor.

Expression-input interactions may define `expectedSemanticEquation` with a derived-result equation
id and `side: "rhs"` while still keeping `expectedExpression` and `acceptedExpressions` for the
limited text-input validator.

Practice checking still uses the existing interaction validators. Expression-input validation is
not symbolic algebra and still depends on normalized strings plus accepted expressions.

## Explore

The current Explore schema is still limited to static notices. It may also define
`observedQuantityIds` as a mechanics-critical placeholder for future Explore observations; each id
must reference a registered semantic quantity such as an unknown reaction or generic quantity.

## Locale alignment

Problem registration compares `en` and `de` mechanics-critical structure. Keep these aligned:
- ids and numeric values for parameters, points, bodies, supports, loads, reactions, and
  force decompositions
- coordinate system and Phase 2 planar entities: quantities, free-body scopes, joints, ropes, and
  force actions
- semantic equations, solver config, and generated equation ids
- solution equation ids, step ids, and canvas object id arrays, including `visibleObjects` and
  `hiddenBaseObjects`
- practice step ids, interaction ids, semantic equation/term references, expected equation
  semantics, correct ids, and canvas object id arrays, including `visibleObjects`,
  `hiddenBaseObjects`, and `revealObjects`
- diagram object references such as load ids, reaction ids, component ids, point ids, and dimension
  endpoint ids

Localized prose, visible titles, feedback wording, hints, and layout-only diagram offsets may
differ by locale.
