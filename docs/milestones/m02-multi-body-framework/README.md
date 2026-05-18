# M02 Multi-Body Framework

## Status

Active/planned. This milestone is not complete.

## Goal

Generalize the current beam-oriented mechanics and canvas framework into a planar multi-body core
that supports the two target problems and similar exam-style statics tasks.

M02 is not primarily about introducing a new mechanics topic. It is a framework expansion milestone:
mechanics modeling, solvers, diagrams, canvas state, Practice validation, and Explore mode should
become capable of handling multi-body and non-beam equilibrium problems.

## Required Final Outcomes

- Generalized planar body model beyond the current `rigidBeam` shape.
- Support for multiple bodies in one problem.
- Support for joints/hinges, support reactions, rope/cable forces, belt/contact-style force
  directions, and non-beam rigid-body diagrams.
- Diagram and canvas framework no longer tied to one straight beam renderer.
- Minimum semantic equation model for consistency between Solve, Practice, and Explore.
- Real interactive Explore mode for all catalog problems, including the two existing beam problems
  and the two new M02 problems.
- Two new polished bilingual catalog problems based on the supplied reference images.

## Acceptance Criteria

M02 is complete when:

- All catalog problems have Explain/Solve, Practice, and real interactive Explore modes.
- The two existing beam problems still work after the framework changes.
- The articulated ladder and belt tensioner/idler pulley problems are implemented as polished
  bilingual catalog problems.
- The mechanics model supports the M02 target problems without hardcoding them as one-off examples.
- Solver output, Solve display, Practice expected answers, and Explore-derived values share a
  minimum semantic equation model.
- Diagram and canvas infrastructure supports non-beam rigid-body diagrams and authored visibility
  states for the M02 target problems.
- Representative Solve, Practice, and Explore canvas states are covered by visual regression or
  equivalent rendering checks.
- `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `CURRENT_STATE.md`, and milestone TODO/reporting are
  updated to reflect the final M02 contracts.

## Target Problems

- Articulated ladder with rope and eccentric load.
- Belt tensioner / idler pulley equilibrium.

Both target problems must eventually include:

- Explain/Solve mode.
- Practice mode.
- Explore mode.
- German and English content.

The exact learning steps and practice flow for the ladder exercise are not final yet and should be
specified before implementation.

## Explicit Non-Goals

- No freeform user workspace or problem editor.
- No full CAS or heavy symbolic algebra system.
- No broad mechanics platform for every future topic.
- No internal force diagrams, friction topic expansion, springs, or distributed-load topic
  expansion unless a narrow part is required as infrastructure for the two M02 target problems.

## Handoff Notes

Avoid one-off renderers or solvers that only work for the supplied screenshots. M02 should create a
clean path for similar planar multi-body exam problems.

Fixed authored solution paths are acceptable for M02. Fully alternative solution strategies remain
future work unless a narrow alternative is needed to avoid misleading students.

Existing beam problems should remain working while the framework is generalized. They should also
receive real Explore mode during this milestone.

Future substantial reports for this milestone belong in `reports/`.
