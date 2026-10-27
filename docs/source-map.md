# Handbook source map

## Components

- [Refresh helper](../scripts/refresh-handbook.mjs): shared cache, cooldown and candidate checks.
- [Consumer launcher](../scripts/handbook.mjs): committed helper loading and revision resources.
- [Integration tooling](../scripts/handbook-integration.mjs): offline readiness and explicit entrypoint sync.
- [Enrollment helper](../scripts/enroll.mjs): existing assigned issue enrollment.
- [Shared skills](../.agents/skills): canonical procedures and imported resources.

## Documentation

[README](../README.md) routes adoption. [Bootstrap](bootstrap.md) defines task context;
[work policy](work-policy.md) defines authority; [project operations](project.md) defines
the existing organization project. [Domains](guidance/README.md) route reusable guidance.
[Onboarding](onboarding.md) defines integration; [provenance](../PROVENANCE.md) records imports.

## Commands

[package.json](../package.json) owns check/test/validate and Handbook integration commands.
[Tests](../test) use disposable repositories and fixtures; no production services.

## Generated areas

Claude skill wrappers are managed by the explicit sync command; preserve custom suffixes.
[skills-lock.json](../skills-lock.json) is regenerated only after reviewing intentional changes.
Policy, canonical skills and docs are manually maintained. Local cache/resource snapshots
live under Git metadata and are never committed.

## Ownership

Admins review shared policy under [work policy](work-policy.md); project ownership remains
with each consumer. No application or deployment is owned here. Individual task ownership
comes from the assignment, not credentials. [Verification](verification.md) records evidence
and pending checks. Consumer code maps and application operational facts belong elsewhere.
