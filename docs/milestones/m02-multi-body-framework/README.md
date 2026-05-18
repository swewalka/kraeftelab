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
- `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, `CURRENT_STATE.md`, and milestone TODO/reporting are
  updated to reflect the final M02 contracts.

## Target Problems

- Articulated ladder with rope and eccentric load.
- Belt tensioner / idler pulley equilibrium.

Reference material lives in `docs/milestones/m02-multi-body-framework/resources/`:

- `m2-mechanical-problems.pdf` contains both M02 mechanics problem statements and related figures.
- `ladder-graphic.png`, `ladder-graphic-free-body.png`, and
  `ladder-graphic-free-body-components.png` are extracted ladder references.
- `belt-tensioner-graphic.png` and `belt-tensioner-graphic-free-body.png` are extracted
  Spannrolle/belt-tensioner references.

Both problems in the PDF include a computational solution. Use those computational solutions as
reference material for mechanics checks, equations, and numeric validation while extracting the
final app problem specs.

The Spannrolle problem material includes a graphical solution. Ignore that graphical solution
completely when implementing the app problem; use only the problem statement, mechanics setup, and
figure references plus the computational solution as source material.

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
