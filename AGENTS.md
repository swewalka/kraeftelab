# Mechanics Playground Agent Guide

## Project Goal

Mechanics Playground is a browser-based engineering mechanics learning app for students. The long-term goal is an extensible 2D mechanics platform that can support statics topics such as equilibrium, friction, internal forces, multi-body systems, and interactive answer checking.

## Current MVP Scope

The current version focuses only on analytical support reactions for one statically determinate beam problem:

- horizontal rigid beam,
- pin support at A,
- roller support at B,
- one vertical downward point load at midspan,
- free-body diagram concept,
- equilibrium equations,
- transparent step-by-step solution.

The MVP should stay small, robust, and easy to extend.

## Do Not Implement Yet

Do not add these until the underlying architecture needs them:

- force dragging,
- graphical force polygons,
- friction,
- internal force diagrams,
- full problem editor,
- generated exercises,
- student accounts,
- authentication,
- database or backend code,
- physics simulation engines,
- heavy symbolic algebra/CAS,
- complex routing,
- broad design systems.

## Architecture

Problem data must be separated from app logic. React components render structured problem data and solver output; they must not contain mechanics calculations.

The core flow is:

1. a `ProblemDefinition` describes geometry, supports, loads, parameters, and unknowns,
2. a solver reads the problem definition and returns a typed `SolverResult`,
3. the explanation layer turns problem data and solver output into `SolutionStep` objects,
4. React components render diagrams, equations, results, and learning modes.

## Main Folders

- `src/app`: application composition and top-level mode state.
- `src/components/layout`: shell, header, tabs, and page layout components.
- `src/components/problem`: problem statement and parameter display.
- `src/components/diagram`: Konva canvas rendering. Keep props data-oriented so future interaction layers can be added without changing mechanics solvers.
- `src/components/equations`: equation and solution step rendering.
- `src/components/results`: final reaction/result summaries.
- `src/content/problems`: structured problem definitions. Treat these as JSON-like data even when written as TypeScript.
- `src/mechanics/core`: math, vectors, units, and low-level numerical utilities.
- `src/mechanics/model`: shared domain types and problem definition contracts.
- `src/mechanics/solvers`: solver implementations grouped by topic.
- `src/mechanics/explanation`: educational solution step builders.
- `src/styles`: global Tailwind/CSS entry points.

## Coding Conventions

- Use strict TypeScript and explicit domain types.
- Keep mechanics calculations outside JSX.
- Prefer clear names such as `supportA`, `supportB`, `reactionAx`, `reactionAy`, `reactionBy`, `beamLength`, `loadMagnitude`, and `loadPosition`.
- Avoid vague names such as `item`, `obj`, `value1`, or `forceThing`.
- Keep files small and focused.
- Add comments only when they clarify non-obvious mechanics or numerical logic.
- Do not introduce dependencies unless they remove real complexity.
- Keep rendering components mostly presentational.

## Mechanics Conventions

Use a right-handed 2D statics coordinate system:

- `x` is positive to the right,
- `y` is positive upward,
- counterclockwise moments are positive.

Support reactions should be represented as unknowns with a support id, component, label, and direction vector.

External forces should be represented by a point of application and a vector in SI units.

## Units Convention

Internal calculations use SI units:

- meters (`m`),
- newtons (`N`),
- newton meters (`N m`).

Display formatting may convert to student-friendly units such as `kN` or `kN m`, but the stored problem data and solver calculations should remain SI.

## Problem Definitions

Problem definitions should be structured data under `src/content/problems`.

A problem should define:

- stable `id`,
- `title`,
- topic identifier,
- concise statement,
- parameters with internal numeric values and display strings,
- points,
- bodies,
- supports,
- loads,
- unknown reactions.

Keep definitions JSON-compatible where practical. Avoid functions inside problem definitions unless there is a compelling reason.

## Solver Guidelines

Solvers should:

- accept typed problem data,
- validate the parameters they require,
- return typed `SolverResult` data,
- keep formulas transparent,
- avoid fake symbolic manipulation,
- use numerical utilities from `src/mechanics/core` when useful,
- avoid React imports.

For this MVP, direct equilibrium equations are acceptable. Future general solvers can introduce matrix assembly and a broader linear system solver while preserving the existing result shape.

## Diagram And Canvas Rendering

The main mechanics diagram uses `react-konva` and `konva`, not SVG. The current renderer is intentionally beam-specific, but it is split into small canvas components:

- `MechanicsCanvas` owns the responsive `Stage`, container measurement, and world-to-canvas transform.
- `DottedGridLayer` renders the technical dotted-paper background as a Konva layer.
- `BeamDiagramLayer` renders the current beam problem from `ProblemDefinition` and `SolverResult`.
- `ForceArrow`, `SupportSymbol`, `DimensionLine`, and `Label` are reusable canvas primitives.

Mechanics coordinates and canvas coordinates must stay separated. Mechanics data uses `x` positive right and `y` positive upward. Browser canvas coordinates use `y` positive downward, so the renderer must convert through a clear `worldToCanvas(point)` function. Do not put canvas coordinates into problem definitions or solver output.

Future interactive features should be implemented in the canvas layer. Dragging should update controlled problem parameters or draft problem state, then solvers should recompute from that state. Do not mutate solver results directly, and do not make render components the source of mechanics truth.

## Safe Extension Notes

When adding new mechanics features:

- extend domain types first,
- add problem data second,
- add or update solvers third,
- generate explanation data fourth,
- render the new output last.

Prefer new focused solver modules over making the first beam solver generic too early. Future additions should preserve compatibility with:

- multi-body rigid systems,
- internal hinges,
- ropes,
- friction contacts,
- free-body diagrams per body,
- beam internal force diagrams,
- interactive force dragging,
- JSON-loaded problems,
- generated exercises,
- student answer checking.

Do not mix future feature scaffolding into the MVP UI unless there is a clear typed contract behind it.
