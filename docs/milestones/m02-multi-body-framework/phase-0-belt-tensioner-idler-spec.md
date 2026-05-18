# Phase 0 Spec: Belt Tensioner / Idler Pulley Equilibrium

## Source And App Identity

Canonical source:

- `resources/m2-mechanical-problems.pdf`, page "Beispiel 6 - Spannrolle"
- Figure references:
  - `resources/belt-tensioner-graphic.png`
  - `resources/belt-tensioner-graphic-free-body.png`

Use the PDF problem statement and computational solution as the durable mechanics source. The
extracted PNGs are figure references only.

Important source exclusion:

- The PDF includes a graphical solution with a force scale `mu_F = 100 N/cm`.
- Ignore the graphical solution completely for app implementation.
- Do not use the graphical solution to drive Solve, Practice, Explore, solver, validation, or
  diagram behavior.
- `mu_F` may be mentioned as source context only; it is not an app parameter for this problem.

Target catalog identity:

- Problem id and folder name: `belt-tensioner-idler-pulley`
- Topic: `statics.equilibrium`
- German title: `Spannrolle im Riementrieb`
- English title: `Belt tensioner / idler pulley equilibrium`
- Catalog order: append after `articulated-ladder-rope-load`.

## Source Problem Statement

The source problem describes a belt drive with a tensioning roller. The roller should create a belt
tension of magnitude `F_A` in belt section `A` while the belt drive is at rest. The weight of the
belt and the rod are neglected. All bearings are frictionless.

Given source values:

- `alpha = 45 deg`
- `beta = 60 deg`
- `F_A = 500 N`
- `mu_F = 100 N/cm`, only for the graphical solution and not app implementation source material

Requested source result:

- required weight force `F_G` of the tensioning roller that ensures the given belt force `F_A`

The source computational solution also introduces:

- `F_B`: belt force in the other belt section
- `F_S`: rod/support force through the inclined link
- `r`: pulley radius used only in the moment equation about the pulley center

## Mechanics Model

Coordinate and sign convention:

- `+x` points to the right.
- `+y` points upward.
- `+z` moment is counterclockwise in the drawing plane.
- The computational free body isolates the tensioning roller/idler.

Body:

- `idlerPulley`: rigid circular roller treated as a planar body.

Important points and geometry:

- `M`: center of the roller and moment point for the computational solution.
- `contactA`: belt contact where force `F_A` acts tangentially on the roller.
- `contactB`: belt contact where force `F_B` acts tangentially on the roller.
- `rodAttachment`: line of action of the rod/support force `F_S`; for equilibrium modeling, the
  exact visual attachment can be authored through diagram geometry while the mechanics force acts
  along the source line of action.
- `r`: pulley radius. It cancels out in the source moment equation and does not need to be a primary
  Explore control.

Forces on the isolated roller:

- `F_A`: known belt force, acting up and left along the belt tangent at angle `alpha` above the
  negative x direction. In source equations this contributes `-F_A*cos(alpha)` in x and
  `+F_A*sin(alpha)` in y.
- `F_B`: unknown belt force, acting horizontally to the right in the source free body.
- `F_S`: unknown rod/support force, acting up and left along a line related to `beta`. In source
  equations this contributes `-F_S*sin(beta)` in x and `+F_S*cos(beta)` in y.
- `F_G`: unknown weight force of the roller, acting vertically downward.

Bearings and contacts:

- Belt/roller contacts are represented as tangential contact forces, not as distributed contact
  pressure.
- All bearings are frictionless.
- Belt and rod self-weight are neglected.

## Computational Reference

The source solution uses the following equations for the isolated roller:

```text
sum F_x = 0:      F_B - F_A*cos(alpha) - F_S*sin(beta) = 0
sum F_y = 0:      F_A*sin(alpha) - F_G + F_S*cos(beta) = 0
sum M_M,z = 0:    -F_A*r + F_B*r = 0
```

The moment equation gives:

```text
F_B = F_A
```

Combining the force equations gives the final result:

```text
F_G = F_A * ((1 - cos(alpha))/tan(beta) + sin(alpha))
```

Source numeric check:

```text
alpha = 45 deg
beta = 60 deg
F_A = 500 N
F_G = 438.1 N
```

Useful intermediate numeric checks from the same equations:

```text
F_B = 500.0 N
F_S = F_A * (1 - cos(alpha)) / sin(beta) = 169.1 N
```

Solve and Practice should remain symbolic. Numeric values are for validation and Explore.

## Planned Learning Sequence

Explain/Solve should teach the problem as force equilibrium of an isolated non-beam body.

1. Isolate the tensioning roller and discard the surrounding belt-drive geometry except for force
   directions.
2. Identify belt forces as tangential contact forces.
3. Resolve `F_A` and `F_S` into signed x/y components using the source angle conventions.
4. Use moment equilibrium about `M` to show `F_B = F_A`.
5. Use horizontal force equilibrium to solve the intermediate rod/support force `F_S`.
6. Use vertical force equilibrium to derive the required weight `F_G`.
7. Present `F_G` as the final symbolic result and show the source numeric check.

Practice should ask students to:

- select the tensioning roller as the free body
- identify the correct tangential directions of `F_A` and `F_B`
- identify the direction of `F_S`
- choose moment point `M` to eliminate `F_G` and `F_S` and derive `F_B = F_A`
- assemble the signed x/y equilibrium equations
- solve for `F_S` as an intermediate
- derive and interpret the required `F_G`

## Diagram And Canvas Requirements

Required diagram views:

- full setup view showing the belt path, neighboring pulleys, idler pulley, angles `alpha` and
  `beta`, and weight `F_G`
- isolated roller free-body view showing `F_A`, `F_B`, `F_S`, `F_G`, point `M`, angle markers, and
  the coordinate convention
- optional component-focused view for `F_A` and `F_S`

The diagram should use reusable planar primitives: disc, tangent belt segments, tangent force
arrows, weight arrow, inclined force arrow, angle markers, labels, and construction lines. It should
not require a belt-specific React renderer.

Canvas object ids should separate:

- physical source objects: roller, belt segments, rod/support line, point `M`
- mechanics quantities: `F_A`, `F_B`, `F_S`, `F_G`
- construction objects: angle markers, tangent lines, coordinate axes, component arrows

## First-Pass Explore Spec

Catalog-wide Explore baseline for M02:

- `simple-supported-beam-center-load`: vary `loadMagnitude` and `loadPosition`; observe `A_y`,
  `B_y`, and the symmetry condition when the load is centered.
- `simple-supported-beam-angled-load`: vary `loadMagnitude`, `loadAngle`, and `loadPosition`;
  observe `F_x`, `F_y`, `A_x`, `A_y`, and `B_y`.
- `articulated-ladder-rope-load`: use the controls and observations in
  `phase-0-articulated-ladder-spec.md`.
- `belt-tensioner-idler-pulley`: use the controls and observations below.

Controls:

- `F_A`: slider or stepper, default `500 N`, suggested range `100 N` to `2000 N`, step `50 N`
- `alpha`: slider, default `45 deg`, suggested range `20 deg` to `70 deg`, step `1 deg`
- `beta`: slider, default `60 deg`, suggested range `30 deg` to `80 deg`, step `1 deg`

Observed quantities:

- `F_G`
- `F_B`
- `F_S`
- signed components of `F_A` and `F_S` where useful for teaching

Constraints:

- Keep `0 deg < alpha < 90 deg`.
- Keep `0 deg < beta < 90 deg`.
- Avoid `beta` values near `0 deg` because `tan(beta)` and `sin(beta)` make the derived result
  numerically unstable and physically misleading for this setup.

## Representation Requirements For Later Phases

The spec must be representable using planned reusable M02 concepts:

- rigid non-beam body
- circular/disc diagram body
- belt/contact tangential forces
- support or rod force with authored line of action
- semantic force component equations using `sin` and `cos`
- semantic moment equation about a named point
- numeric evaluation from the same semantic equations used by Solve and Practice

Do not implement this as a graphical force-polygon exercise, a one-off belt solver, or formulas
duplicated in UI components.
