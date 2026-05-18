# KraefteLab Current State

This document describes the current implementation state. It is not the finished product vision.
Current architecture, schemas, and UI patterns are provisional and may change when the active
milestone requires a cleaner path toward `PRODUCT_VISION.md`.

## Implemented Product Surface

- The app opens on a catalog landing page.
- German (`de`) and English (`en`) content are supported; German is the default.
- The catalog currently contains two statics equilibrium beam problems:
  - simply supported beam with a center point load
  - simply supported beam with an angled off-center point load
- The single-problem workspace has three modes:
  - Explain/Solve
  - Practice
  - Explore

## Current Mode Behavior

- Explain/Solve presents symbolic, authored solution steps.
- Practice presents guided interactive checks using the existing practice runner.
- Explore currently shows the problem overview and static notices. It does not yet provide real
  interactive parameter variation.
- Numeric parameter values exist in problem definitions for validation and future Explore behavior,
  but Solve and Practice should stay symbolic.

## Current Technical Shape

- Problem content is localized JSON under `src/content/problems`.
- `src/content/problems/catalog.ts` registers localized problem pairs and runs German/English
  mechanics-alignment checks.
- Core mechanics types live under `src/mechanics/model`; reusable calculations live under
  `src/mechanics/core`.
- The only registered solver is the beam reaction solver for
  `simply-supported-beam-reactions`.
- The only registered diagram renderer is the beam diagram renderer.
- Canvas state uses authored `visibleObjects`, optional `hiddenBaseObjects`, and annotations.
- Registration-time validation checks solver config, force decomposition contracts, diagram
  references, and authored canvas object ids.

## Current Limitations

- The mechanics model is still beam-oriented:
  - body kind is effectively limited to `rigidBeam`
  - support kinds are limited to pin and roller
  - loads are limited to point forces
  - parameter units are limited to `m`, `N`, and `deg`
- The current solver workflow assumes one beam, one point load, and three reactions.
- The current diagram framework is still centered on a straight beam renderer.
- Practice expression input is not symbolic algebra; it depends on normalized strings and accepted
  expressions.
- There is no semantic equation model yet.
- There is no real interactive Explore mode yet.
- There is no freeform workspace, user authoring flow, backend, accounts, or persistence.

## Active Direction

The active milestone is `docs/milestones/m02-multi-body-framework/`. It is expected to change this
current state significantly by generalizing mechanics, solver, diagram, canvas, semantic equation,
and Explore infrastructure for planar multi-body and non-beam statics problems.
