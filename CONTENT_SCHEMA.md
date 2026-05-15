# Problem Content Schema

Problem content is localized, but mechanics-critical ids and numeric data must match between
`de` and `en`.

## Problem definition

Required top-level problem fields:
- `id`, `title`, `topic`, `problemType`, `solverKey`, `diagramKey`, `statement`
- `parameters`, `points`, `bodies`, `supports`, `loads`, `unknownReactions`
- `solverConfig`

Optional top-level problem fields:
- `forceDecompositions`
- `explore`

Parameter units currently supported by the parser are `m`, `N`, and `deg`.

## Force decompositions

Use `forceDecompositions` when a point force is represented through signed x/y components.

Each decomposition must define:
- `id`
- `forceId`
- `magnitudeParameterId` with unit `N`
- `angleParameterId` with unit `deg`
- `angleReference`, currently only `positive-x`
- `components.x` and `components.y`

Each component must define:
- `id`
- `axis`: `x` or `y`
- `sign`: `+` or `-`
- `factor`, for example `cos(alpha)` or `sin(alpha)`
- `expression`, for example `F*cos(alpha)` or `-F*sin(alpha)`
- `latex`, used by diagram overlays when they reference `componentId`

The parser checks that the stored load vector matches the declared decomposition.

## Solver config

`solverConfig` is parsed according to `solverKey`. The current supported solver key is
`simply-supported-beam-reactions`.

Beam reaction solver config must define:
- `beamLengthParameterId` with unit `m`
- `loadId`
- `loadMagnitudeParameterId` with unit `N`
- `loadPositionParameterId` with unit `m`
- optional `loadDecompositionId`
- `horizontalReactionId`, `leftVerticalReactionId`, `rightVerticalReactionId`
- `equationIds.sumForceX`, `equationIds.sumMomentAboutLeftSupport`, `equationIds.sumForceY`

Solver config references are validated during content registration, including equation ids from
the solution content.

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

Beam diagram configs may define `angleMarkers` for arc-based angle annotations. Each marker uses a
diagram object id, anchor point id, label, radius, start/end angles in canvas degrees, label offset,
and font size.

## Practice semantics

Equation-builder terms may include `semantic.componentId`. When present, the component id must
reference a declared force-decomposition component, and the term factor must include that
component's factor unless the term is explicitly a zero factor.

Practice checking still uses the existing interaction validators. Expression-input validation is
not symbolic algebra and still depends on normalized strings plus accepted expressions.

## Locale alignment

Problem registration compares `en` and `de` mechanics-critical structure. Keep these aligned:
- ids and numeric values for parameters, points, bodies, supports, loads, reactions, and
  force decompositions
- solver config and generated equation ids
- solution equation ids, step ids, and canvas object id arrays, including `visibleObjects` and
  `hiddenBaseObjects`
- practice step ids, interaction ids, expected equation semantics, correct ids, and canvas object
  id arrays, including `visibleObjects`, `hiddenBaseObjects`, and `revealObjects`
- diagram object references such as load ids, reaction ids, component ids, point ids, and dimension
  endpoint ids

Localized prose, visible titles, feedback wording, hints, and layout-only diagram offsets may
differ by locale.
