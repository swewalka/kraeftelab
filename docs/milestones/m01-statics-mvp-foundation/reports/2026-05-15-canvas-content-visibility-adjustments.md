# Canvas Content Visibility Adjustments

## Task summary

Adjusted problem-specific diagram visibility after the binary canvas-state cleanup.

## Changed files

- Center-load solution and practice JSON in German and English
- Angled-load solution and practice JSON in German and English
- Angled-load diagram JSON in German and English

## Implementation decisions

- Added `beam`, `pointA`, and `pointB` to every authored Solve and Practice `visibleObjects` list
  for both problems so the beam endpoints and labels A/B stay visible throughout.
- Removed `reactionAx` from center-load Solve canvas states starting with step 3, where the
  explanation establishes `A_x = 0`.
- Flipped the angled-load `reactionAx` free-body arrow to the positive x direction so the visual
  assumed direction matches solver and practice semantics.
- Added a short bilingual note after the negative `A_x` result in angled-load Solve and Practice:
  the negative value means the actual force acts opposite to the assumed positive arrow direction.
- Removed the angled-load `dimensionLoadToB` (`L-a`) dimension from the diagram and from authored
  canvas states.
- Removed the small point-label `F` at the angled-load attack point.

## Verification performed

- `npm run typecheck`
- `npm run build`
- Searched the angled-load content for stale `dimensionLoadToB` and point-label `F` references.
- Checked that every authored Solve and Practice canvas state includes `beam`, `pointA`, and
  `pointB`.
- Checked that center-load Solve states from step 3 onward no longer include `reactionAx`.

## What works

- The two beam problems now keep the structural beam context visible in every Solve and Practice
  step.
- Center-load Solve stops showing the zero horizontal reaction once it has been eliminated.
- The angled-load assumed `A_x` direction is visually consistent with the equation semantics.

## Fragile or questionable

- No visual regression screenshots were run, so exact diagram layout quality is still manually
  unverified.
- The angled-load final vertical result still uses `(L-a)` in formulas, but the dimension line is no
  longer drawn because it is not needed for the guided diagram sequence.

## Future recommendations

- Add representative visual regression checks for Solve and Practice steps before adding more
  problems.
- Add canvas-id validation so removed diagram ids cannot remain in `visibleObjects`.

## Context file updates

- Checked `AGENTS.md`, `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `DESIGN.md`, and `TODO.md`.
- No context files needed updates because this was problem-specific content and diagram data.
