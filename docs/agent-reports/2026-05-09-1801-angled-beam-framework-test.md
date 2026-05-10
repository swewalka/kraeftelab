# Angled Beam Framework Test Report

Date/time: 2026-05-09 18:01 Europe/Vienna

## 1. Summary

Implemented a second beam problem: a simply supported beam with pin support at A, roller support at B, span `L`, an off-center angled force `F` applied at distance `a`, and angle `alpha` measured from the positive x-axis. The force is defined as acting downward-right:

```tex
F_x = F\cos(\alpha)
```

```tex
F_y = -F\sin(\alpha)
```

The problem is available in German and English. It supports Explore, Solve, and Practice modes. Solve Mode uses structured content blocks and separate LaTeX math blocks. Practice Mode reuses the existing step runner with checkbox, matching, canvas click, equation builder, expression input, and multiple-choice interactions.

What works well: the content folder pattern, localized JSON loading, ContentBlockRenderer, and most existing practice interactions were reusable. The solver registry could remain stable by extending the existing beam reaction solver with an optional angle parameter.

What does not work well: the canvas renderer is still beam-specific, expression validation is not a real symbolic system, and Solve Mode has no content-driven canvas-state synchronization per solution step. The new diagram overlays are reusable within the beam renderer, but they are still not a general mechanics diagram model.

## 2. Framework Fit

Content model: good for adding localized teaching copy, parameters, ids, and step order. It is less strong for shared physical constructs such as force decomposition, angle definitions, and component relationships; these had to be repeated in problem, solution, practice, and diagram files.

Practice step model: strong enough for this problem. The existing interaction types handled reaction identification, decomposition matching, moment point selection, lever-arm matching, equation building, expression input, and final checks. However, expression input remains string-normalization based.

Solve walkthrough model: worked well for curated steps. The separation between solution content and solver-generated equation lines is useful, but the solver equations are still limited to a fixed three-equation beam reaction workflow.

LaTeX/math rendering model: worked well. Full equations can be represented as separate `math` blocks, and option labels can carry LaTeX. This is one of the better parts of the framework.

Validation system: adequate for equation-builder steps because terms carry semantic metadata. Insufficient for expression-input steps because equivalent symbolic forms are accepted through normalization and explicit accepted strings rather than algebraic equivalence.

Canvas rendering system: usable for a second beam problem after adding reusable beam overlays for component arrows, marker polylines, and dimension y-offsets. It is still not ready for arbitrary mechanics diagrams.

Bilingual content support: worked. Keeping mechanics-critical ids aligned across locales is manageable, but the amount of duplicated localized JSON is already high.

Step/canvas synchronization: Practice Mode has good active-step canvas state. Solve Mode does not. In Solve Mode the free-body style diagram shows configured overlays broadly rather than changing per explanation step.

Equation builder: worked for semantic term selection, including compound factors such as `sin(alpha)*a`. It does not represent equation sides, algebraic transformations, or alternative valid strategies.

## 3. What Worked Well

The existing `PracticeStep` model handled reaction-identification without changes.

The existing matching interaction handled force decomposition and lever-arm identification cleanly.

The canvas-click interaction handled choosing moment point A without new interaction code.

The equation-builder interaction handled semantic moment terms such as `B_y` with factor `L` and `F` with factor `sin(alpha)*a`.

The ContentBlockRenderer made it straightforward to keep full equations as separate LaTeX blocks across solve and practice content.

The problem catalog and localized content loader made it easy to register one problem per locale once a selector was added.
 
The existing specialized beam solver could be extended without changing the solver registry key used by the first problem.

## 4. What Became Awkward

Force decomposition has no shared content or mechanics model. The same decomposition appears in problem statements, solution steps, practice feedback, equation-builder terms, and diagram annotations.

The expression validator is fragile. It can accept common forms such as `F*sin(alpha)*a/L`, but it does not understand algebra. Forms such as reordered subtraction, expanded expressions, or equivalent factorizations require explicit accepted strings or normalization rules.

Canvas annotations are too beam-specific. The new overlay arrows and polyline markers are cleaner than a one-off renderer, but they are still nested inside `BeamDiagramLayer` rather than a general overlay abstraction.

Solve Mode does not synchronize canvas state to solution steps. The second problem needs decomposition arrows during relevant steps, but Solve Mode currently has no per-step `canvasState` contract.

The solver output is numerically useful but pedagogically rigid. It always emits three beam reaction equations. It cannot express alternative equation order, alternative moment points, or symbolic-only solution output.

The current diagram config mixes physical ids, rendered offsets, labels, colors, and pedagogical overlay decisions.

## 5. What Does Not Scale

Multiple bodies: not supported well. Domain types contain bodies, but the solver, renderer, and explanation flow assume one beam.

Multiple coordinate systems: not supported. Angle definition is copy-level plus solver config, not a typed coordinate-system contract.

Arbitrary force directions: partially supported for this one beam case. There is no reusable vector decomposition model with signed components.

Different diagram types: not ready. Trusses, pulleys, friction contacts, hydrostatics, and inclined planes need renderers with different primitives and selection behavior.

Free-body diagram extraction: not supported. The free-body diagram is manually described in content and diagram config.

Multiple valid solution strategies: not supported. Practice assumes a fixed path: horizontal equilibrium, moments about A, vertical equilibrium.

Alternative moment points: not supported beyond feedback. Choosing B could be valid, but the step runner expects A.

Symbolic and numeric answers: partially supported. Solver computes numeric values; practice asks symbolic strings. There is no common symbolic expression representation connecting both.

Units: basic support only. Parameters now include `deg`, but units are still a union type and not a general unit system.

Sign convention changes: not supported as data. The app assumes positive x right, y up, counterclockwise positive.

Partial credit: limited. Mistake feedback works for missing/wrong/extra equation terms but not for deeper algebraic errors.

Schnittgrößen/internal force diagrams and distributed loads: not supported. These require interval data, sign conventions, and diagram layers beyond point-force equilibrium.

## 6. Code/Design Smells Found

The beam solver assumes a simply supported beam with one point load and exactly three reactions.

The solver config is a loose `unknown` object parsed inside the solver, so schema errors are discovered late.

Parameter units are hardcoded as a TypeScript union and had to be extended for `deg`.

The canvas renderer uses ids from content but still assumes a beam line, supports, reactions, and dimensions.

Expression validation is coupled to string normalization, not a semantic expression tree.

Practice feedback ids are generated from validator internals such as `wrongSign:F` and normalized factors, which makes content sensitive to validator implementation details.

Solve Mode has no direct way for solution steps to drive canvas highlights or overlays.

Diagram labels need custom canvas math formatting separate from the main KaTeX rendering path.

Bilingual files duplicate large structures that must remain id-aligned manually.

## 7. Recommendations

Must fix before adding more beam problems:

- Add a typed solver-config parser layer near content loading or problem registration.
- Add a reusable force-decomposition content/mechanics contract.
- Add per-solution-step canvas state, similar to Practice Mode.
- Improve expression validation for common symbolic equivalence instead of relying only on accepted string lists.
- Add content validation that compares mechanics-critical ids across locales.

Must fix before adding non-beam statics problems:

- Introduce a generalized physical entity model for bodies, forces, supports, contact forces, moments, and line of action.
- Separate diagram overlays from beam rendering so other renderers can reuse arrows, angle markers, dimensions, and highlights.
- Add a semantic equation model with terms, factors, sides, units, and equation purpose.
- Support alternative solution paths and alternative correct moment points.
- Model coordinate systems and sign conventions explicitly.

Nice to have later:

- Build authoring checks for missing math blocks inside teaching content.
- Add shared localized glossary snippets for recurring statics phrases.
- Add a small symbolic normalizer for polynomial/trig products used in beginner statics.
- Add visual regression tests for key canvas states.
- Add a problem preview/catalog panel once more than a few problems exist.

## 8. Suggested Next Framework Improvements

Create a reusable `ForceDecomposition` model:

```ts
type ForceDecomposition = {
  forceId: string;
  angleReference: "positive-x";
  components: {
    x: { expression: "F*cos(alpha)"; sign: "+" };
    y: { expression: "F*sin(alpha)"; sign: "-" };
  };
};
```

Create a semantic equation representation that can power solver output, equation-builder terms, and expression feedback.

Add a problem graph/state model so bodies, supports, unknowns, loads, equations, and diagram objects can reference the same source of truth.

Move canvas overlays into renderer-agnostic primitives with visibility controlled by step content.

Add support for alternative correct solution paths, especially different moment points and different equation order.

Add locale-pair validation for mechanics-critical ids and numeric values.

## 9. Final Verdict

The framework is ready for a few more beam reaction problems if they stay close to this pattern: one beam, simple supports, point loads, fixed step order, and simple symbolic expressions.

It is not ready for non-beam mechanics problems without significant refactoring. The main blockers are the beam-specific solver/renderer, weak symbolic validation, lack of generalized force/component modeling, and absence of Solve Mode canvas synchronization.

Before scaling content, the most important refactor is to introduce a shared semantic mechanics/equation layer that connects content, solver output, practice validation, and diagram annotations.
