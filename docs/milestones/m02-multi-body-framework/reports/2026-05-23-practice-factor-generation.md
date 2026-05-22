# Practice Validator Factor Generation Fix

## Task summary

Fixed the Practice equation-builder factor bug reported in the Phase 1 semantic equation handoff.
Semantic expected terms now generate validator factors from a plain machine-readable expression
renderer instead of rendered LaTeX.

## Changed files

- `src/mechanics/semantic/expression.ts`
- `src/mechanics/practice/factors.ts`
- `src/mechanics/practice/validatePracticeAnswer.ts`
- `src/content/problems/parsing.ts`
- `ARCHITECTURE.md`
- `CONTENT_SCHEMA.md`

## Implementation decisions

- Added `renderPlainSemanticExpression` for ASCII practice factors such as `L/2`,
  `cos(alpha)`, and `sin(alpha)*a`.
- Centralized Practice factor normalization in `src/mechanics/practice/factors.ts` so parsing and
  runtime validation use the same rules.
- Removed the LaTeX sanitization path from semantic Practice factor generation.
- Added registration-time validation that every semantic expected equation term has a matching
  selectable equation-builder term with the same semantic ids, sign, component id, and normalized
  factor.

## Verification performed

- Ran `npm run typecheck`.
- Ran `npm run build`.
- Loaded the parsed catalog through Vite SSR and confirmed generated expected factors include:
  `L`, `L/2`, `cos(alpha)`, and `sin(alpha)*a`.

## What works

- The center-load moment Practice step now generates `L/2` for `moment-a-load`, so the correct
  `- F \cdot L/2` selectable term matches the semantic expected term.
- Existing angled-load semantic Practice factors still generate `cos(alpha)` and
  `sin(alpha)*a`.
- Build-time content registration now catches future semantic expected-term/selectable-term factor
  mismatches across both locales.

## Fragile or questionable

- Practice expression input remains a limited normalized-string validator and is unchanged by this
  fix.
- The plain renderer is intentionally small and follows the current semantic expression subset; it
  is not a general symbolic simplifier.

## Future recommendations

- Keep future Practice equation-builder factors sourced from semantic expression data, not from
  display strings.
- Add dedicated automated tests if a test runner is introduced for the mechanics/practice layer.

## Context file updates

- Updated `ARCHITECTURE.md` and `CONTENT_SCHEMA.md` with the plain Practice factor contract and
  registration guard.
