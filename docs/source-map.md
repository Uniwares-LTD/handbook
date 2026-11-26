# Handbook source map

## Components

- [Refresh helper](../scripts/refresh-handbook.mjs): shared cache, cooldown and candidate checks.
- [Consumer launcher](../scripts/handbook.mjs): committed helper loading and revision resources.
- [Integration tooling](../scripts/handbook-integration.mjs): offline readiness, entrypoint sync, the AGENTS.md session contract and Claude workflow routing.
- [Enrollment helper](../scripts/enroll.mjs): existing assigned issue enrollment.
- [Issue creation helper](../scripts/create-issue.mjs): approved issue creation with project enrollment.
- [Access check](../scripts/org-access.mjs): read-only organization team and permission gap report.
- [Shared skills](../.agents/skills): canonical procedures and imported resources.
- [Starter templates](../.agents/templates): issue/PR forms and docs starters copied once by consumers.

## Documentation

[Repository preferences](../.agents/repository.md) record the issue language.
[README](../README.md) routes adoption. [Bootstrap](bootstrap.md) defines task context;
[work policy](work-policy.md) defines authority and [GitHub access order](work-policy.md#github-access); [project operations](project.md) defines
shared project procedures; [organization access](organization-access.md) defines the
default teams and permissions; [local operations](uniwares-project.md) describe Handbook's existing organization project. Consumer tracking is never selected from this map. [Domains](guidance/README.md) route reusable guidance; engineering owns operational handoff/evidence principles and communication owns operator instruction format.
[Engineering](guidance/engineering.md#choose-the-workflow) owns proportional routing and
review completion and the [simplicity baseline](guidance/engineering.md#simplicity-baseline);
[large-issue delivery](guidance/large-issues.md) supplies the conditional
interview, PRD and checkpoint procedure. [Templates](templates.md) define permissive starters and their use.
[Onboarding](onboarding.md) defines integration; [provenance](../PROVENANCE.md) records imports.

## Commands

[package.json](../package.json) owns check/test/validate and Handbook integration commands.
Handbook's own [issue forms](../.github/ISSUE_TEMPLATE) mirror the shared starters; its PR
template adds the policy approval section.
[Tests](../test) use disposable repositories and fixtures; no production services.

## Generated areas

Explicit sync manages Claude wrappers and the gated entries in `.claude/settings.json`.
Consumer sync also manages the AGENTS.md session-contract block and Claude startup
routing, both from the canonical communication guide and on by default. Preserve custom
suffixes, settings and content outside the marked block.
[CI](../.github/workflows/validate.yml) runs `npm run validate` for this repository only;
consumers are not asked to copy or enable it; [guidance lints](../scripts/guidance-lint.mjs)
check skill catalogs, tool-neutral wording and description budgets.
[skills-lock.json](../skills-lock.json) is regenerated only after reviewing intentional changes.
Consumer `.agents/handbook.md` is generated from [consumer bootstrap](consumer-bootstrap.md)
by handbook:sync; consumer skills retain only discovery metadata and direct routing.
Policy, canonical skills and docs are manually maintained. Local cache/resource snapshots
live under Git metadata and are never committed.

## Ownership

Handbook Admins review policy under [local governance](../README.md#contribution); project ownership remains
with each consumer. No application or deployment is owned here. Individual task ownership
comes from the assignment, not credentials. Evidence lives in issues and PRs; Handbook's
[open checks](uniwares-project.md#open-checks) are tracked with its local operations. Consumer code maps and application operational facts belong elsewhere.
