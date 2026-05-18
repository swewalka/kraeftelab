# TODO

This file tracks global and cross-milestone backlog items for KraefteLab. Milestone-specific tasks
belong in the active milestone's `TODO.md`.

Current milestone state:

- `docs/milestones/m01-statics-mvp-foundation/` is closed.
- `docs/milestones/m02-multi-body-framework/` is active/planned.
- M02 owns the multi-body framework, real Explore mode, semantic equation minimum, and the two
  canonical non-beam/multi-body problems.

## Global Backlog

- Remove the temporary Practice Mode debug advance button once visual inspection of final result
  feedback is done.
- Improve locale-validation diagnostics so German/English mismatches report the exact path instead
  of a single generic mismatch.
- Add a small authoring check for final result formulas: final support reactions should use
  `tone: "result"` and intermediate equations should not.
- Rework the workspace header layout: the current problem title and mode toggle placement is
  functional but not final, and needs better spacing/responsiveness.
- Plan support for distributed loads, internal force diagrams, additional multi-body systems beyond
  the M02 target problems, inclined planes, friction, and other future topics.
- Add shared localized glossary snippets for recurring statics phrases while keeping mechanics ids
  aligned across locales.
- Reduce duplicated localized JSON structure where possible without mixing localized prose into
  generic mechanics logic.
