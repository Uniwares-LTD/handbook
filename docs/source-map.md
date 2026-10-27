# Handbook source map

## Components

- [Refresh helper](../scripts/refresh-handbook.mjs): shared cache, cooldown and candidate checks.
- [Consumer launcher](../scripts/handbook.mjs): committed helper loading and revision resources.
- [Integration tooling](../scripts/handbook-integration.mjs): offline readiness and explicit entrypoint sync.
- [Enrollment helper](../scripts/enroll.mjs): existing assigned issue enrollment.
- [Issue creation helper](../scripts/create-issue.mjs): approved issue creation with project enrollment.
- [Shared skills](../.agents/skills): canonical procedures and imported resources.

## Documentation

[Repository preferences](../.agents/repository.md) record the issue language.
[README](../README.md) routes adoption. [Bootstrap](bootstrap.md) defines task context;
[work policy](work-policy.md) defines authority; [project operations](project.md) defines
shared project procedures; [local operations](uniwares-project.md) describe Handbook's existing organization project. Consumer tracking is never selected from this map. [Domains](guidance/README.md) route reusable guidance.
[Onboarding](onboarding.md) defines integration; [provenance](../PROVENANCE.md) records imports.

## Commands

[package.json](../package.json) owns check/test/validate and Handbook integration commands.
[Tests](../test) use disposable repositories and fixtures; no production services.

## Generated areas

Claude skill wrappers and the gated entries in `.claude/settings.json` are managed by the
explicit sync command from `.agents/gated-commands.json`; preserve custom suffixes and settings.
[CI](../.github/workflows/validate.yml) runs `npm run validate` for this repository only;
consumers are not asked to copy or enable it; [guidance lints](../scripts/guidance-lint.mjs)
check skill catalogs, tool-neutral wording and description budgets.
[skills-lock.json](../skills-lock.json) is regenerated only after reviewing intentional changes.
Policy, canonical skills and docs are manually maintained. Local cache/resource snapshots
live under Git metadata and are never committed.

## Ownership

Handbook Admins review policy under [local governance](../README.md#contribution); project ownership remains
with each consumer. No application or deployment is owned here. Individual task ownership
comes from the assignment, not credentials. [Verification](verification.md) records evidence
and pending checks. Consumer code maps and application operational facts belong elsewhere.
