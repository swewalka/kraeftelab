# AGENTS.md

## Project Context

KraefteLab is an interactive mechanics learning app for students. It combines visual mechanics problems, step-by-step solution explanations, and interactive practice workflows.

The project should stay extensible beyond the current beam examples. Future content may include support reactions, angled forces, friction, internal forces, multi-body systems, hydrostatics, and other mechanics topics.

German (`de`) and English (`en`) are supported. German is the default language.

## Core Agent Rule

Do not optimize only for the current task. Every substantial change must preserve a clean path for future mechanics problems, future interaction modes, and bilingual content.

Before implementation, inspect the existing structure and use the project context files as the source of truth.

Relevant context files:

- `AGENTS.md` — agent workflow and project-level rules
- `ARCHITECTURE.md` — application structure, boundaries, and data flow
- `CONTENT_SCHEMA.md` — problem/content format and validation expectations
- `DESIGN.md` — visual and UX rules, when present
- `docs/agent-reports/` — implementation, review, and architecture reports written by agents

If these files conflict, prefer the more specific file. For example, `CONTENT_SCHEMA.md` overrides generic content advice in this file.

## Expected Workflow

For non-trivial changes, follow this sequence:

1. Read the relevant context files.
2. Inspect the existing implementation before editing.
3. Identify the smallest clean change that satisfies the task.
4. Write or mentally form a short plan before implementation.
5. Implement within scope.
6. Run available checks such as typecheck, lint, tests, or build.
7. Review the change critically.
8. Update relevant context files if the change affects future work.
9. Write a report in `docs/agent-reports/` for substantial changes.

Do not rewrite unrelated parts of the app. Do not introduce broad abstractions unless the current task clearly needs them.

## Architecture Boundaries

Keep these boundaries intact:

- Problem-specific teaching content belongs in `src/content/problems`.
- Generic mechanics logic belongs in reusable mechanics/domain modules.
- React components should not contain hardcoded mechanics solutions.
- Solvers should not contain curated teaching prose.
- Diagram renderers should consume structured problem and diagram data instead of hidden example constants.
- Generic UI strings belong in the i18n layer.
- Localized educational text belongs in localized content files.

When adding a new feature, ask whether the implementation would still make sense for a different mechanics problem type. If not, isolate the problem-specific part in content, a solver, a renderer adapter, or a clearly named domain module.

## Content Rules

Problem content should be structured, localized, and data-driven.

Problem-specific content includes:

- problem statements
- given values and units
- diagram annotations
- solution steps
- practice prompts
- hints and feedback
- localized labels
- assumptions
- result explanations

Avoid hardcoding this content in React components or solver logic.

Keep German and English versions mechanically aligned unless the task intentionally defines different problems. IDs, units, solver keys, diagram keys, point IDs, reaction IDs, and numeric values should remain consistent across locales.

## Math and Explanation Rendering

All mathematical notation shown in the UI should use the shared math/rendering components.

General rules:

- Use inline math only for short symbols inside prose.
- Use separate math blocks for equations, substitutions, transformations, and final formulas.
- Do not place full equations directly inside normal paragraph text in the explanation or practice panel.
- Keep rendered LaTeX separate from answer validation.
- Practice checking should use semantic expected-answer data, not visual LaTeX strings.

## Internationalization

The app supports:

- `de` — German, default locale
- `en` — English, fallback locale

Rules:

- Do not hardcode visible UI strings in components.
- Add generic UI labels to the i18n layer in both languages.
- Keep problem-specific teaching copy in localized content files.
- Do not duplicate components for different languages.
- Check user-facing features in both German and English before handoff.

German wording should be natural technical German suitable for HTL/TU-level students.

## Implementation Standards

Use strict, explicit TypeScript. Prefer clear domain names over vague generic names.

Keep files focused. Keep mechanics calculations outside JSX. Keep rendering components mostly presentational. Add comments only when they explain non-obvious mechanics, numerical logic, or architecture boundaries.

Do not add new dependencies unless they remove real complexity and are justified in the report.

## Mechanics Conventions

Use a consistent 2D statics convention unless a specific problem defines otherwise:

- positive `x` points right
- positive `y` points upward
- counterclockwise moments are positive
- internal calculations use SI units

Display formatting may use student-friendly units such as `kN` or `kN m`, but stored data and solver calculations should remain consistent with the project schema.

## Context File Maintenance

After any substantial feature, refactor, architecture change, schema change, solver change, renderer change, or UX pattern change, check whether the context files need updates.

Update context files when the change introduces or modifies:

- architecture boundaries
- folder structure
- content schema
- solver contracts
- renderer contracts
- math rendering rules
- practice-mode behavior
- bilingual content rules
- reusable mechanics abstractions
- design or interaction conventions
- known limitations relevant to future agents

Do not rewrite context files unnecessarily. Updates should be concise, durable, and based on actual code changes.

Every substantial handoff must include a context-maintenance section stating:

- which context files were checked
- which context files were updated
- which context files did not need updates and why

## Agent Reports

For substantial tasks, create a Markdown report in `docs/agent-reports/`.

The report should include:

- task summary
- changed files
- implementation decisions
- verification performed
- what works
- what is fragile or questionable
- future recommendations
- context file updates

Reports should be factual and critical. Do not use them as marketing summaries.

## Do Not Do Without Explicit Request

Do not add these unless directly requested or required by an approved plan:

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

## Handoff Expectations

At the end of a substantial task, provide a concise summary containing:

1. What changed
2. How it was verified
3. What remains fragile
4. Which context files were checked or updated
5. Where the agent report was written

Prefer honest partial completion over pretending a change is fully verified when checks were not run or failed.
