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

The app is bilingual. German (`de`) and English (`en`) must both remain supported, with German as the default language.

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

Problem-specific data and teaching flow belong under `src/content/problems`. Shared app, mechanics, solver, rendering, and UI layers must not hide one-off example content.

The core flow is:

1. a content folder provides JSON for mechanics data, solution flow, diagram annotations, and practice copy,
2. a thin TypeScript loader validates JSON and converts it into typed domain objects,
3. `ProblemDefinition` metadata selects a solver by `solverKey`,
4. the solver computes numeric results and equation lines,
5. the explanation builder combines solver output with curated solution content,
6. the canvas chooses a renderer by `diagramKey` and renders configured diagram annotations.

Content owns problem-specific items such as title, statement, parameter values, points, bodies, supports, loads, unknowns, solver configuration, explanation text, step order, equation display copy, assumptions, result headings, diagram annotations, hints, and practice prompts.

Mechanics owns reusable concepts and computations such as points, vectors, forces, supports, unknown reactions, equilibrium equations, solver results, unit formatting, coordinate conventions, linear equation utilities, and validation helpers.

Generic UI text belongs in the i18n layer, not in React components. Problem-specific teaching text belongs in localized content files, not in generic UI translation files.

## Main Folders

- `src/app`: application composition and top-level mode state.
- `src/components/layout`: shell, header, tabs, and page layout components.
- `src/components/problem`: problem statement and parameter display.
- `src/components/diagram`: Konva canvas rendering, renderer registry, and canvas primitives.
- `src/components/equations`: equation and solution step rendering.
- `src/components/results`: final reaction/result summaries.
- `src/content/problems`: discoverable problem content folders, JSON files, catalog registration, and JSON parsing.
- `src/i18n`: locale types, generic UI translation dictionaries, provider, and translation hook.
- `src/mechanics/core`: math, vectors, units, and low-level numerical utilities.
- `src/mechanics/model`: shared domain types and problem definition contracts.
- `src/mechanics/solvers`: solver implementations and solver registry.
- `src/mechanics/explanation`: generic assembly of curated solution content with solver output.
- `src/styles`: global Tailwind/CSS entry points.

## Content Folders

Each problem should be discoverable in one folder under `src/content/problems`. The current pattern is:

- `problem.en.json` / `problem.de.json`: metadata, `problemType`, `solverKey`, `diagramKey`, mechanics definition, parameters, solver config, and localized problem copy.
- `solution.en.json` / `solution.de.json`: curated guided solution flow, equation titles/explanations, assumptions, and result panel title.
- `diagram.en.json` / `diagram.de.json`: problem-specific renderer annotations, localized stage labels, and ids consumed by the selected diagram adapter.
- `practice.en.json` / `practice.de.json`: practice-mode copy and future prompts.
- `index.ts`: thin loader only; avoid mechanics calculations or educational copy here.

Prefer real JSON for content. If TypeScript is needed, keep it as a parser, adapter, or registration layer. Invalid content should fail with clear errors instead of silently rendering partial diagrams or incomplete solutions.

To add a new problem, create a content folder with both English and German content files, add it to `src/content/problems/catalog.ts` for both locales, and reuse an existing `solverKey`/`diagramKey` when the mechanics and rendering contracts match. Add a new solver or renderer only when the new problem type actually needs one.

Localized problem files for the same problem must keep mechanics-critical ids and numeric data aligned unless the intended mechanics problem actually differs. In particular, preserve matching `id`, `problemType`, `solverKey`, `diagramKey`, point ids, body ids, support ids, load ids, reaction ids, equation ids, solver config ids, vectors, SI values, and units across locales. Localize visible teaching copy such as titles, statements, body labels when shown, notices, solution text, assumptions, equation explanations, result headings, practice copy, and language-dependent diagram labels.

## Internationalization

Supported locales are:

- `de`: German, default locale.
- `en`: English, fallback locale.

Use the lightweight custom i18n layer in `src/i18n`.

- Use `useI18n()` and `t(key)` for generic UI strings in components.
- Add generic UI keys to `src/i18n/translations.ts` in both languages at the same time.
- Do not hardcode visible German or English UI strings in React components.
- Do not duplicate components for different languages.
- Keep the language switcher reload-free and preserve app state where possible.
- Persisted locale may use `localStorage`; do not add routing only for language switching unless there is a separate clear need.
- Generic UI translations should fall back to English if a key is missing.

Separate translation ownership carefully:

- Generic UI: app title/subtitle, mode names, button labels, tab labels, section headings, empty states, generic validation/error messages, and generic canvas labels.
- Problem-specific content: problem title, statement, parameter descriptions, educational paragraphs, hints, practice text, diagram labels when language-dependent, step titles/bodies, equation display copy, assumptions, and result summary headings.
- Solver/explanation output: generated numeric results and equation lines should stay solver-owned. Do not localize by changing mechanics calculations or duplicating solver logic. If solver-generated prose ever becomes necessary, introduce a typed localization contract instead of embedding prose in solvers.

German copy should use natural technical German suitable for HTL/TU students. Preferred terms include:

- statics: Statik
- equilibrium: Gleichgewicht
- support reaction(s): Lagerreaktion(en), Lagerkräfte
- pin support: Festlager
- roller support: Loslager
- free-body diagram: Freischnitt
- isolate / cut free: freischneiden
- equilibrium equations: Gleichgewichtsbedingungen
- sum of forces: Summe der Kräfte
- sum of moments: Summe der Momente
- external force: äußere Kraft
- reaction force: Reaktionskraft or Lagerkraft
- beam: Balken
- load: Last
- vertical force: vertikale Kraft
- moment about A: Momentengleichgewicht um A
- counterclockwise positive: gegen den Uhrzeigersinn positiv
- unknowns: Unbekannte
- known values: gegebene Werte
- result: Ergebnis
- final reactions: finale Lagerkräfte

## Coding Conventions

- Use strict TypeScript and explicit domain types.
- Keep mechanics calculations outside JSX.
- Keep problem-specific ids and values in content unless they are part of an explicitly specialized solver or renderer adapter.
- Keep visible strings either in `src/i18n/translations.ts` or localized content files.
- Avoid vague names such as `item`, `obj`, `value1`, or `forceThing`.
- Keep files small and focused.
- Add comments only when they clarify non-obvious mechanics, numerical logic, or architecture boundaries.
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

## Solver Guidelines

Solvers should:

- be selected through `solverKey`,
- accept typed problem data and solver config,
- validate required parameters, reactions, and equation ids,
- return typed `SolverResult` data,
- compute values and equation lines without embedding curated teaching paragraphs,
- keep formulas transparent,
- avoid fake symbolic manipulation,
- use numerical utilities from `src/mechanics/core` when useful,
- avoid React imports.

For this MVP, the current `simply-supported-beam-reactions` solver is intentionally specialized. Future general solvers can introduce matrix assembly and broader linear system support while preserving the existing result shape.

## Diagram And Canvas Rendering

The main mechanics diagram uses `react-konva` and `konva`, not SVG. `MechanicsCanvas` owns the responsive `Stage`, dotted paper background, container measurement, and world-to-canvas transform. It chooses a diagram adapter by `diagramKey`.

The current `beam-diagram` renderer is intentionally beam-specific, but it should consume ids and annotations from localized `diagram.*.json` files instead of hardcoded example constants. Keep `ForceArrow`, `SupportSymbol`, `DimensionLine`, and `Label` reusable.

Mechanics coordinates and canvas coordinates must stay separated. Mechanics data uses `x` positive right and `y` positive upward. Browser canvas coordinates use `y` positive downward, so renderers must convert through `worldToCanvas(point)`. Do not put canvas coordinates into problem definitions or solver output; renderer annotation offsets belong in diagram content.

Future interactive features should be implemented in the canvas layer. Dragging should update controlled problem parameters or draft problem state, then solvers should recompute from that state. Do not mutate solver results directly, and do not make render components the source of mechanics truth.

## Safe Extension Notes

When adding new mechanics features:

- extend domain types first,
- add problem content second,
- add or update solvers third,
- generate explanation data fourth,
- render the new output last.

Future agents should avoid reintroducing hardcoded example logic into shared layers. Problem-specific educational text, step labels, equation ordering, final summaries, diagram annotations, hints, and practice prompts should stay in content.

Future agents should also avoid reintroducing single-language assumptions. Any user-facing feature should be checked in both German and English before handoff.

Current limitations:

- only one specialized beam reaction solver is registered,
- only one beam-oriented Konva renderer is registered,
- no dragging, full editor, generated exercises, backend, student accounts, or broad symbolic/general statics solver exists yet.

Future additions should preserve compatibility with:

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
