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
- solution equation ids and step ids
- practice step ids, interaction ids, expected equation semantics, correct ids, and canvas object
  id arrays
- diagram object references such as load ids, reaction ids, component ids, point ids, and dimension
  endpoint ids

Localized prose, visible titles, feedback wording, hints, and layout-only diagram offsets may
differ by locale.
