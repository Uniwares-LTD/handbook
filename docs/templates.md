# Templates

Templates give people and agents a simple first draft. They are permissive: a starting
point, not a gate.

## Principles

- **Start small.** An issue form requires one field: the outcome, or for a bug the
  problem. Every other section is optional and shows a placeholder hint, not prefilled text.
- **Override freely.** Skip, rename, reorder or delete any section, or write without a
  template. Exceptions are only what readiness checks parse: the preferences lines and
  the five source-map headings.
- **Triage completes the work.** Scope, acceptance, priority and ownership are confirmed
  during triage and review ([work policy](work-policy.md#issue-structure)), not enforced
  by a form.
- **The repository owns its copies.** Copies are made once and changed locally. Shared
  updates reach a copy only when a developer names it.

## Catalog

Shared starters live in [`.agents/templates`](../.agents/templates). The second column
shows where a repository keeps its copy.

| Starter | Local copy | Use for |
| --- | --- | --- |
| `github/ISSUE_TEMPLATE/{bug,feature,task,initiative}.yml`, `config.yml` | `.github/ISSUE_TEMPLATE/` | Issue forms (blank issues stay enabled), and the section order of agent-drafted issues |
| `github/PULL_REQUEST_TEMPLATE.md` | `.github/PULL_REQUEST_TEMPLATE.md` | PR descriptions |
| `docs/source-map.md` | `sourceMap` in handbook.json | Repository navigation |
| `docs/repository-adapter.md` | `guidance` in handbook.json | Local guidance for agents and contributors |
| `docs/repository.md` | `preferences` in handbook.json | Issue language and durable branches |
| `docs/feature-spec.md` | `docs/templates/` | Specs from compile-feature-spec |
| `docs/prd.md`, `docs/implementation-plan.md` | `docs/templates/` | Large-work requirements and checkpoint plans from compile-feature-spec |
| `docs/decision-record.md` | `docs/templates/` | Decisions and their consequences |
| `docs/how-to.md` | `docs/templates/` | Task guides and runbooks |

The lessons-learned template stays with the capture-project-learnings skill.

## Finding and using a template

1. Use the repository's local copy when one exists. The repository guidance lists its
   template locations; for an issue body that is the matching `.github` form.
2. Otherwise read the shared starter at the task's Handbook revision, for example
   `git -C PATH show REVISION:.agents/templates/docs/how-to.md`, or open it in the
   resources snapshot.
3. Follow its headings for the draft. Fill in what is known, mark unknowns, and delete
   sections that do not apply. Never invent content just to fill a section.

| Task | Template | Skill |
| --- | --- | --- |
| Draft an issue | Matching issue form | manage-issues |
| Describe a PR | PR template | work-on-task |
| Write a spec | Feature spec | compile-feature-spec |
| Plan large work | PRD and implementation plan | compile-feature-spec |
| Record a decision | Decision record | capture-project-learnings, maintain-docs |
| Write a guide or runbook | How-to | maintain-docs |
| Start repository docs | Source map, guidance, preferences | maintain-docs |

## Copying and updating

These are starters, not required artifacts for every task. Small work needs none;
medium plans can stay in the conversation. For large work, use existing canonical
locations or the defaults in [large-issue delivery](guidance/large-issues.md).

The maintain-docs skill starts and updates a repository's docs and templates. It uses
this offline command, run from the consumer root with the resources snapshot as source:

```text
npm run handbook:templates -- --source SNAPSHOT            # preview: missing, same or differs
npm run handbook:templates -- --source SNAPSHOT --write    # copy missing files only
npm run handbook:templates -- --source SNAPSHOT --update .github/PULL_REQUEST_TEMPLATE.md
```

The command does the following:

- It copies the issue and PR templates to `.github`.
- It copies the adoption documents to the `sourceMap`, `guidance` and `preferences`
  paths in handbook.json. It skips a document when its path is unset, names an anchor,
  or names AGENTS.md or CLAUDE.md, and the result lists each skipped template with
  the reason.
- It copies the other pages to `docs/templates`.
- It never overwrites or deletes a file. `--update` replaces only the files that are named.
- It reports any `--update` name that matches nothing.

Handbook's own issue forms must match the shared starters, and `npm run check` enforces this.
