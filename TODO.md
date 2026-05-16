# TODO

This file tracks durable next steps for KraefteLab. Keep it current: when an agent completes a
listed item, delete that item from this file during the same handoff.

## Immediate Cleanup

- Remove the temporary Practice Mode debug advance button once visual inspection of final result
  feedback is done.
- Improve locale-validation diagnostics so German/English mismatches report the exact path instead
  of a single generic mismatch.
- Add a small authoring check for final result formulas: final support reactions should use
  `tone: "result"` and intermediate equations should not.

## Symbolic Answers And Equations

- Introduce a semantic equation model with equation purpose, sides, terms, factors, signs, units,
  and referenced mechanics ids.
- Use the semantic equation model to connect solver output, Solve Mode equation display,
  equation-builder expected answers, and feedback.
- Add a small symbolic normalizer for beginner statics expressions, especially products,
  fractions, signs, and simple trigonometric factors.
- Decouple feedback ids from validator implementation details such as normalized factor strings.
- Support alternative valid solution strategies, including different equation order and different
  valid moment points.

## Diagrams And Canvas

- Add visual regression checks for representative Solve and Practice canvas states.
- Decide how Explore Mode will show real numeric values without leaking numeric display into Solve
  or Practice.

## UI/UX

- Rework the workspace header layout: the current problem title and mode toggle placement is
  functional but not final, and needs better spacing/responsiveness.

## Mechanics Domain Model

- Introduce a more general physical entity model for bodies, forces, supports, contact forces,
  moments, line of action, and free-body extraction.
- Model coordinate systems and sign conventions explicitly instead of relying only on app-wide
  assumptions.
- Extend beyond the current beam solver's one-beam, one-point-load, three-reaction workflow.
- Plan support for distributed loads, internal force diagrams, multi-body systems, inclined planes,
  friction, and other non-beam topics.

## Content Authoring And Scale

- Add shared localized glossary snippets for recurring statics phrases while keeping mechanics ids
  aligned across locales.
- Reduce duplicated localized JSON structure where possible without mixing localized prose into
  generic mechanics logic.
- Keep adding new beam problems only if they fit the current fixed-path beam reaction pattern; do
  not use near-duplicate content growth as a substitute for the semantic equation and diagram work
  above.
