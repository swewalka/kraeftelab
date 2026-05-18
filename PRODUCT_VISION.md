# KraefteLab Product Vision

This document describes the intended finished product direction. It is not a snapshot of the
current implementation. For the current app state, read `CURRENT_STATE.md`.

## Product Goal

KraefteLab is a self-study tool for mechanical engineering students at the beginning of their
studies. It helps students understand basic mechanics principles, relationships between concepts,
and exam-relevant solution workflows.

The primary product role is mechanics exam preparation, not professional engineering analysis,
automated homework generation, or a general-purpose simulation environment.

## Target Audience

- Mechanical engineering students in the first semesters.
- Students preparing for introductory mechanics exams.
- German-speaking students as a primary audience, with English also supported.
- HTL/TU-level learners who need precise, natural mechanics terminology.

## Mechanics Learning Roadmap

The product should focus first on planar force systems (`ebene Kraftsysteme`).

Planned learning areas include:

- Analytical equilibrium calculations (`Gleichgewicht rechnerisch`), especially support reactions
  (`Lagerreaktionen`).
- Linear springs (`lineare Federn`), including translational springs (`Feder`) and torsional springs
  (`Drehfeder`).
- Internal force diagrams and section resultants for beams (`Schnittgroessen fuer Traeger`),
  including straight beams and curved beams with a radius.
- Static and sliding friction (`Haften/Reiben`).

## Learning Modes

KraefteLab should keep a three-mode learning pattern:

- Explain/Solve: guided symbolic explanation of a problem and its solution path.
- Practice: interactive checks that guide the student through relevant reasoning steps.
- Explore: interactive variation of selected problem parameters to reveal relationships between
  quantities and solution behavior.

Solve and Practice should prioritize symbolic exam-style reasoning. Numeric values and direct
parameter variation belong primarily in Explore mode.

Explore mode should let students change selected variables that influence the solution either
numerically or logically. For later problems, Explore may support structural changes such as adding
or removing a force and observing how the solution behavior changes.

## Recurring Mechanics Building Blocks

The following building blocks are expected to recur across many problems and should be modeled in a
reusable way when implementation work reaches them.

External loads:

- Point load (`Punktlast`).
- Distributed surface or area load (`Flaechenlast`).
- Applied external couple moment (`externes Moment`).

Supports and constraints:

- Pin support (`Festlager`).
- Roller support (`Loslager`).
- Fixed or clamped support (`Einspannung`), including moment reaction.
- Frictionless contact (`reibungsfreier Kontakt`).
- Contact with friction (`Kontakt mit Reibung`).

Idealized bodies:

- Self-weight is neglected by default.
- Beams, straight or curved with a radius.
- Ropes or cables that transfer tension only.
- Rigid bodies such as rollers and rectangular blocks.

## Unresolved Long-Term Ideas

The long-term idea of a freeform workspace where users create their own statics problems, build a
solution/explanation path, and share it with others is not committed product scope yet. It needs
separate product and technical review before agents treat it as a planned feature.
