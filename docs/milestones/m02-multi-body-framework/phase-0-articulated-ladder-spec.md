# Phase 0 Spec: Articulated Ladder With Rope And Eccentric Load

## Source And App Identity

Canonical source:

- `resources/m2-mechanical-problems.pdf`, page "Beispiel 8 - Leiter rechnerisch"
- Figure references:
  - `resources/ladder-graphic.png`
  - `resources/ladder-graphic-free-body.png`
  - `resources/ladder-graphic-free-body-components.png`

Use the PDF statement, figure, and computational solution as the durable mechanics source. The
extracted PNGs are figure references only.

Target catalog identity:

- Problem id and folder name: `articulated-ladder-rope-load`
- Topic: `statics.equilibrium`
- German title: `Gelenkleiter mit Seil und exzentrischer Last`
- English title: `Articulated ladder with rope and eccentric load`
- Catalog order: append after the two existing beam problems and before
  `belt-tensioner-idler-pulley`.

## Source Problem Statement

The source problem describes a ladder with height `h` and footprint width `2a` standing on a
horizontal plane. A vertical load `F_L` acts downward. Its line of action is parallel to the
centerline and offset by `lambda*a` from the centerline.

The ground contact at `A` is immovable. At `B` there is a frictionless rotating roller. The hinge at
`C` is frictionless and rotatable. Between `D` and `E`, at height `h/3`, an inextensible ideal rope
is tensioned. Self-weight of the ladder and rope is neglected compared with `F_L`.

Given source parameters:

- `a`
- `h`
- `lambda`
- `F_L`

Requested source results:

- ground/contact force at `A`, represented by components `F_Ax` and `F_Ay`
- ground/contact force at `B`, represented by vertical force `F_B`
- rope force in `DE`, represented by `F_S`
- all requested results as functions of `lambda`

## Mechanics Model

Coordinate and sign convention:

- `+x` points to the right.
- `+y` points upward.
- `+z` moment is counterclockwise in the drawing plane.
- Moments in the source solution are written with respect to point `C` for each ladder half and
  optionally point `B` for the whole-system shortcut.

Bodies and idealized objects:

- `leftLadderHalf`: rigid body from `A` to hinge `C`, with rope attachment point `D`.
- `rightLadderHalf`: rigid body from hinge `C` to roller contact `B`, with rope attachment point
  `E` and the external load line crossing the right half.
- `ropeDE`: ideal inextensible rope between `D` and `E`; it carries only axial tension `F_S`.

Important points:

- `A`: left ground contact, at the left foot of the ladder.
- `B`: right ground contact, roller support at the right foot of the ladder.
- `C`: top hinge connecting both ladder halves.
- `D`: rope attachment on the left half at height `h/3`.
- `E`: rope attachment on the right half at height `h/3`.
- `loadLine`: vertical line of action for `F_L`, offset by `lambda*a` from the vertical centerline.

Geometry:

- Horizontal distance from `A` to the centerline through `C`: `a`.
- Horizontal distance from the centerline through `C` to `B`: `a`.
- Total footprint width: `2a`.
- Vertical height from ground to `C`: `h`.
- Rope height above ground: `h/3`.
- Moment lever arm of the rope force about `C` on each ladder half: `2h/3`.
- Moment lever arm of each vertical foot reaction about `C`: `a`.
- Moment lever arm of the vertical load about `C`: `lambda*a`.

Supports, joints, and unknowns:

- At `A`, use reaction components `F_Ax` and `F_Ay`.
- At `B`, the frictionless roller transfers only vertical reaction `F_B`.
- At `C`, the hinge transfers action-reaction components `F_Cx` and `F_Cy`; these are internal for
  the whole system and appear with opposite signs on the two isolated ladder halves.
- In rope `DE`, use shared axial tension `F_S`; it pulls the left half toward the right at `D` and
  pulls the right half toward the left at `E`.
- The external load is `F_L` downward on the right half at the authored load line.

## Computational Reference

The source solution uses the following free-body equations.

Left ladder half:

```text
sum F_x = 0:      F_Ax + F_S - F_Cx = 0
sum F_y = 0:      F_Ay - F_Cy = 0
sum M_C,z = 0:    h*F_Ax - a*F_Ay + (2h/3)*F_S = 0
```

Right ladder half:

```text
sum F_x = 0:      F_Cx - F_S = 0
sum F_y = 0:      F_B + F_Cy - F_L = 0
sum M_C,z = 0:    a*F_B - lambda*a*F_L - (2h/3)*F_S = 0
```

Whole system:

```text
sum F_x = 0:      F_Ax = 0
sum F_y = 0:      F_Ay + F_B - F_L = 0
sum M_C,z = 0:    h*F_Ax - a*F_Ay - lambda*a*F_L + a*F_B = 0
```

Equivalent whole-system moment about `B`:

```text
sum M_B,z = 0:    -2a*F_Ay + (1 - lambda)*a*F_L = 0
```

Final source results:

```text
F_Ax = 0
F_Ay = F_L/2 * (1 - lambda)
F_B  = F_L/2 * (1 + lambda)
F_S  = F_L * 3a/(4h) * (1 - lambda)
```

The app should keep Solve and Practice symbolic. Numeric values below are defaults for Explore and
validation, not source-given values:

- `a = 1.5 m`
- `h = 3.0 m`
- `F_L = 1000 N`
- `lambda = 0.4`

With those defaults:

```text
F_Ax = 0 N
F_Ay = 300 N
F_B  = 700 N
F_S  = 225 N
```

## Planned Learning Sequence

Explain/Solve should teach the problem as a multi-body equilibrium task, not as a one-body beam
variant.

1. Introduce the whole system and identify the external forces `F_Ax`, `F_Ay`, `F_B`, and `F_L`.
2. Use whole-system horizontal equilibrium to show `F_Ax = 0`.
3. Use whole-system vertical equilibrium and a useful moment equation to derive `F_Ay` and `F_B`.
4. Split the ladder at hinge `C` and show the action-reaction hinge forces on each half.
5. Add the rope forces at `D` and `E`, emphasizing equal magnitude and opposite directions.
6. Use moment equilibrium about `C` on one ladder half to derive the rope force `F_S`.
7. Present final results as symbolic functions of `lambda`.

Practice should ask students to:

- identify the useful free bodies: whole ladder, left half, right half, and rope where needed
- place support reactions at `A` and `B`
- place hinge action-reaction components at `C`
- place rope tension directions at `D` and `E`
- choose moment point `C` to eliminate hinge forces for the split-body equations
- build the semantic equations for whole-system equilibrium and split-body moment equilibrium
- derive `F_Ay`, `F_B`, and `F_S`

## Diagram And Canvas Requirements

Required diagram views:

- full setup view with geometry dimensions `a`, `a`, `h`, `h/3`, and `lambda*a`
- whole-system free-body view with `F_Ax`, `F_Ay`, `F_B`, and `F_L`
- split-body free-body view with hinge components, rope forces, support reactions, and load
- optional rope-only view showing equal and opposite tension forces at `D` and `E`

The diagram should use reusable planar primitives: rigid line bodies, hinge/pin marker, roller
support, rope segment, vertical load arrow, reaction arrows, dimension arrows, and labels. It should
not require a ladder-specific React renderer.

Canvas object ids should be authored around mechanics ids where possible, for example body ids,
point ids, reaction ids, hinge-force quantity ids, rope-force quantity ids, dimensions, and the
load-line marker.

## First-Pass Explore Spec

Catalog-wide Explore baseline for M02:

- `simple-supported-beam-center-load`: vary `loadMagnitude` and `loadPosition`; observe `A_y`,
  `B_y`, and the symmetry condition when the load is centered.
- `simple-supported-beam-angled-load`: vary `loadMagnitude`, `loadAngle`, and `loadPosition`;
  observe `F_x`, `F_y`, `A_x`, `A_y`, and `B_y`.
- `articulated-ladder-rope-load`: use the controls and observations below.
- `belt-tensioner-idler-pulley`: use the controls and observations in
  `phase-0-belt-tensioner-idler-spec.md`.

Controls:

- `lambda`: slider, default `0.4`, suggested range `-0.8` to `0.8`, step `0.05`
- `F_L`: slider or stepper, default `1000 N`, suggested range `200 N` to `3000 N`, step `100 N`

Observed quantities:

- `F_Ay`
- `F_B`
- `F_S`
- contact validity note when a vertical reaction becomes negative: the ladder is no longer in
  equilibrium under the assumed support model because that support type cannot hold the ladder down,
  so the corresponding foot would lift off in this scenario

Constraints:

- Keep `h > 0` and `a > 0`.
- Keep the default range for `lambda` narrow enough that normal use does not immediately produce
  misleading contact lift-off states.
- If `F_Ay` or `F_B` becomes negative, Explore may still show the computed value, but it must label
  the setup as not in equilibrium for the assumed unilateral support/contact condition.

## Representation Requirements For Later Phases

The spec must be representable using planned reusable M02 concepts:

- multiple rigid bodies
- points and authored geometry
- support reactions
- hinge action-reaction force pairs
- rope/cable tension with shared magnitude and opposite directions by body scope
- authored free-body scopes
- semantic equations scoped to whole system or individual body
- numeric evaluation from the same semantic equations used by Solve and Practice

Do not implement this as a one-off ladder solver, a hardcoded diagram, or prose-only formulas copied
into Practice/Explore.
