# Diagram Overlay Refactor And Canvas Convention Update

Date/time: 2026-05-11 21:28 Europe/Vienna

## Task summary

Implemented the first two Diagrams and Canvas TODO items by extracting reusable overlay state and
angle-marker/arrow behavior while keeping beam geometry in `BeamDiagramLayer`.

## Changed files

- `src/components/diagram/*`: added shared overlay styling/state, arc angle markers, dashed
  component arrows, label opacity, and role-based force colors.
- Beam diagram content JSON: updated reaction arrows to put arrowheads at attack points, changed
  external forces/components to green, reactions to red, and replaced the angled-load polyline
  alpha marker with an arc marker.
- `src/content/problems/localeValidation.ts`: includes `angleMarkers` in localized mechanics
  snapshots.
- `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `DESIGN.md`, `TODO.md`: documented the new conventions
  and removed the completed TODO items.

## Implementation decisions

`highlightedObjects` remains the content field name, but renderers now treat it as important
objects that stay fully opaque. Context objects are dimmed instead of recolored.

Canvas reaction labels now always come from stable reaction labels such as `A_x`, `A_y`, and `B_y`.
`solvedValues` still participates in visibility/solved-state handling, but formulas stay in the
solution or practice panel.

Support symbols are hidden per support once any reaction for that support is visible or solved.
This fixes Practice mode after the unknown reactions have been identified.

The angled-load alpha marker now uses an `angleMarkers` config entry with a reusable arc primitive.
The old polyline marker parser/render path remains for compatibility, but current angled content
uses the new marker.

## Verification performed

- `npm run typecheck`
- `npm run build`
- `git diff --check`

The build completed successfully and exercised localized problem registration.

## What works

Solve and Practice now share the same opacity-based focus semantics. Support reactions render in
red with stable labels, external loads/components render in green, and component arrows are thinner
and dashed.

The support symbols disappear in Practice once reactions are revealed by the completed
identify-reactions step.

## Fragile or questionable

There are still no automated visual regression checks for canvas states. The new arc marker and
component offsets were reviewed through code and build validation, not browser screenshots.

The legacy `polylineMarkers` path remains in the beam renderer. It is harmless for compatibility,
but future diagrams should prefer `angleMarkers`.

## Future recommendations

Add the visual regression checks already listed in `TODO.md`, covering at least the first support
identification step, the first reaction-reveal Practice step, and the angled-load decomposition
step.

Consider moving diagram config parsing out of `BeamDiagramLayer` once another renderer needs the
same overlay contracts.

## Context file updates

Checked `AGENTS.md`, `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `DESIGN.md`, `TODO.md`, and recent
agent reports.

Updated `ARCHITECTURE.md` for the new overlay/state boundary.

Updated `CONTENT_SCHEMA.md` for the `highlightedObjects` semantics, stable canvas labels, and
`angleMarkers`.

Updated `DESIGN.md` for force color conventions and opacity-based focus.

Updated `TODO.md` by removing the two completed Diagrams and Canvas items.

## Follow-up: first-step clarity and brighter force colors

After the initial handoff, the first Solve and Practice steps were adjusted so all objects that are
visible in those initial states are listed as `highlightedObjects`. This keeps the whole supported
beam diagram at full opacity while still avoiding a renderer-level "first step" special case.

Diagram force colors were also brightened: external forces now use `#00a86b`, decomposition
components use `#14b88f`, and support reactions use `#ef4444`.

Verification after this follow-up:

- `npm run typecheck`
- `npm run build`

## Follow-up: arrow sizing and attack-point alignment

Support-reaction labels were moved toward the arrow tails and increased to 22px. Force arrows now
use larger default stroke and arrowheads, and component arrows are solid instead of dashed.

The applied force and decomposition component arrowheads for the angled-load diagram now land
directly on the beam attack point without the previous vertical offset. The center-load force
arrowhead also lands on the beam centerline.

The beam line is forced to full opacity in the beam renderer so it remains visually important in
all authored canvas states without requiring every step to repeat the `beam` id.

Verification after this follow-up:

- `npm run typecheck`
- `npm run build`
