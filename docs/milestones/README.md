# KraefteLab Milestones

Milestones organize short- and mid-term implementation context below the durable root-level project
context.

Root context files describe long-lived product, architecture, schema, design, and workflow rules.
Milestone folders describe a bounded phase of work: its goal, status, tasks, decisions, and agent
reports.

## Context Precedence

Use this precedence when context files disagree:

1. `PRODUCT_VISION.md` defines finished product intent.
2. The active milestone defines current implementation direction and short-term scope.
3. `CURRENT_STATE.md`, `ARCHITECTURE.md`, and `CONTENT_SCHEMA.md` define current implementation
   facts and contracts.
4. Closed milestone docs and reports provide history only.

Current implementation facts are allowed to change when the active milestone needs a better path
toward the product vision. Do not preserve current beam-specific structure just because it exists.

Before substantial work, agents should read:

- root context files listed in `AGENTS.md`
- this milestone index
- the active milestone's `README.md`
- the active milestone's `TODO.md`
- relevant reports in the active milestone's `reports/` folder

## Structure

Each milestone folder should use this shape:

```text
docs/milestones/
  mXX-short-name/
    README.md
    TODO.md
    reports/
```

`README.md` defines the milestone goal, status, implemented outcomes, deferred items, and handoff
notes. `TODO.md` owns milestone-specific task tracking. `reports/` contains factual implementation,
review, and architecture reports written during that milestone.

## Lifecycle

Milestone status values:

- Planned: scoped enough to guide upcoming work, but implementation has not started.
- Active: current short- and mid-term work should align with this milestone.
- Closed: historical context; do not add new implementation work unless explicitly reopening it.

Only one milestone should be active at a time. When a milestone closes, its README should state what
was completed, what was deferred, and where deferred work moved. Reports do not override the active
milestone or root context files.

## Milestone Index

| Milestone | Status | Purpose |
| --- | --- | --- |
| `m01-statics-mvp-foundation` | Closed, with deferred Explore work | Build the base learning app and prove the content/solver/diagram/practice architecture with two beam problems. |
| `m02-multi-body-framework` | Active/planned | Generalize the mechanics, solver, diagram, canvas, and Explore framework for planar multi-body and non-beam statics problems. |

The active milestone is `m02-multi-body-framework`.
