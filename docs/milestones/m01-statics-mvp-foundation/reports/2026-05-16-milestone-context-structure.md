# Milestone Context Structure

## Task summary

Reorganized KraefteLab documentation context from a flat agent-report folder into milestone-driven
context. The first milestone, `m01-statics-mvp-foundation`, now owns the reports and handoff context
for the completed Statics MVP foundation.

## Changed files

- `AGENTS.md`
- product vision document
- `TODO.md`
- `docs/milestones/README.md`
- `docs/milestones/m01-statics-mvp-foundation/README.md`
- `docs/milestones/m01-statics-mvp-foundation/TODO.md`
- moved existing reports from the old flat report folder into
  `docs/milestones/m01-statics-mvp-foundation/reports/`

## Implementation decisions

- Used "Milestones" as the project phase name.
- Kept durable product, architecture, schema, design, and global backlog context at the repository
  root.
- Made milestone folders responsible for short- and mid-term goals, milestone TODOs, and reports.
- Marked M01 as closed/completed except for deferred full Explore mode work.
- Removed the old flat report folder after moving its reports.

## Verification performed

- Checked `git status --short` before restructuring.
- Listed docs with `find docs -maxdepth 4 -type f | sort`.
- Searched for stale old report-folder references.
- No TypeScript or build checks were run because the change is documentation-only.

## What works

- Future agents have a clear path: read root context first, then the active milestone.
- M01 now records its goal, completed outcomes, deferred items, and implementation reports in one
  place.
- Root `TODO.md` now acts as a global/cross-milestone backlog instead of mixing all task scopes.

## Fragile or questionable

- M02 now exists and is the active/planned milestone.
- Existing reports were moved by filesystem move instead of `git mv` because the sandbox could not
  write to `.git/index.lock`; Git should still detect renames based on file content.

## Future recommendations

- Use M02 for full Explore mode and multi-body framework work.
- Keep future substantial reports inside the active milestone's `reports/` folder.
- Avoid reopening M01 for unrelated work; use it as historical foundation context.

## Context file updates

- Checked `AGENTS.md`, the product vision document, `TODO.md`, and existing reports.
- Updated `AGENTS.md` for milestone-based workflow and report location.
- Updated the product vision document to clarify the first MVP foundation is complete but full Explore mode
  remains deferred.
- Replaced root `TODO.md` with a global/cross-milestone backlog index.

## Addendum: context split cleanup

After M02 was introduced, the top-level context was refined so product vision and current
implementation state are separate. The previous product document was replaced by `PRODUCT_VISION.md`,
and `CURRENT_STATE.md` now describes the provisional current implementation. `AGENTS.md` was
trimmed into a workflow/context router, milestone lifecycle and precedence rules were added, and
root `TODO.md` was kept to actionable global backlog items.
