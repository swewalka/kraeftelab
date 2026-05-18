# AGENTS.md

## Purpose

This file is the workflow and context router for agents working on KraefteLab. Keep it concise.
Product intent, current implementation state, architecture contracts, schema details, design rules,
and milestone plans live in their own context files.

KraefteLab is still in early development. The current implementation is not the product vision.
Current architecture, schemas, and UI patterns may and should change aggressively when they block the
active milestone or finished product direction.

## Context Order

Before substantial work, read the relevant context in this order:

1. `PRODUCT_VISION.md` — finished product intent, target audience, learning modes, topic roadmap,
   and unresolved long-term ideas.
2. `docs/milestones/README.md` — milestone process, active milestone, and lifecycle rules.
3. Active milestone `README.md` and `TODO.md` — current goals, scope, acceptance criteria, and task
   ownership.
4. `CURRENT_STATE.md` — implemented behavior and known current limitations.
5. `ARCHITECTURE.md` — current application structure, boundaries, and data flow.
6. `CONTENT_SCHEMA.md` — current content format and validation expectations.
7. `DESIGN.md` — visual and UX rules, when the task affects UI.
8. Root `TODO.md` — global or cross-milestone backlog only.

Reports under milestone `reports/` folders are historical evidence. Use them to understand why
things changed, but they do not override root docs or the active milestone.

If files conflict, prefer the more specific and more current source: active milestone over closed
milestone, schema over generic content advice, architecture/schema over old reports.

## Expected Workflow

For non-trivial changes:

1. Read the relevant context files.
2. Inspect the existing implementation before editing.
3. Identify the clean change that best serves the active milestone and product vision; avoid both
   narrow patches that preserve bad temporary structure and broad rewrites outside scope.
4. Write or mentally form a short plan before implementation.
5. Implement within scope.
6. Run available checks such as typecheck, lint, tests, or build.
7. Review the change critically.
8. Update relevant context files if the change affects future work.
9. Write a report in the active milestone's `reports/` folder for substantial changes.

## Architecture Boundaries

Keep these boundaries intact unless the active milestone explicitly changes them:

- Problem-specific teaching content belongs in `src/content/problems`.
- Generic mechanics logic belongs in reusable mechanics/domain modules.
- React components should not contain hardcoded mechanics solutions.
- Solvers should not contain curated teaching prose.
- Diagram renderers should consume structured problem and diagram data.
- Generic UI strings belong in the i18n layer.
- Localized educational text belongs in localized content files.

When changing a boundary, update `ARCHITECTURE.md`, `CONTENT_SCHEMA.md`, or the active milestone
docs in the same handoff.

## Product And Content Rules

- German (`de`) is the default locale; English (`en`) is supported.
- Keep German wording natural for HTL/TU-level mechanics learners.
- Keep localized problem files mechanically aligned unless a task intentionally defines different
  problems.
- Use shared math/rendering components for mathematical notation.
- Keep rendered LaTeX separate from answer validation.
- Practice checking should use semantic expected-answer data where the current schema supports it.
- Internal mechanics calculations should use SI units and explicit 2D statics conventions unless a
  problem defines otherwise.

## Context Maintenance

After substantial feature, refactor, schema, solver, renderer, UX, or content-pattern changes:

- Check root `TODO.md` and the active milestone `TODO.md`; remove or update completed items.
- Update context files only when future agents need the changed rule, contract, limitation, or
  decision.
- Keep context concise, factual, and current.

Every substantial handoff should state:

1. What changed.
2. How it was verified.
3. What remains fragile.
4. Which context files were checked or updated.
5. Where the milestone report was written, if required.

## Agent Reports

For substantial tasks, create a Markdown report in the active milestone's `reports/` folder.

Reports should include:

- task summary
- changed files
- implementation decisions
- verification performed
- what works
- what is fragile or questionable
- future recommendations
- context file updates

Reports are factual handoff notes, not marketing summaries.

## Do Not Do Without Explicit Request

Do not add these unless directly requested or required by an approved milestone plan:

- authentication
- student accounts
- backend/database infrastructure
- generated exercise systems
- full problem editor
- heavy symbolic algebra/CAS
- broad design-system rewrites
- large routing changes
- physics simulation engines
- unrelated UI redesigns
