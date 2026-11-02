# Maintainable Handbook adoption requirements

## Outcome and users

Consumer maintainers update shared guidance without editing every skill wrapper.
Agents still discover the right skills, follow local authority and complete their tasks.

## Scope and flows

Audit all 16 skills, their resources, shared docs, templates and generated routes.
Implement Handbook first. Preserve the existing Unibase working tree; migrate it only
after fresh Codex acceptance and Claude routing review and separately authorized Handbook merge.
No framework upgrades, new skills, governance changes or live project changes.

## Requirements and acceptance

- R1: One generated consumer bootstrap; short stable skill wrappers preserve discovery.
- R2: Existing version-1 consumers remain usable; custom content is never overwritten.
- R3: Procedure-only changes produce no wrapper churn; bootstrap-only changes update
  one guide; metadata changes update only the relevant native wrappers.
- R4: Consolidation preserves safety conditions, technical examples, provenance,
  licenses, revision retention, local overrides and proportional completion criteria.
- R5: Automated checks and separate reviews pass; behavioral comparisons and fresh
  Codex sessions plus a Claude routing review establish the agreed evidence before migration.

## Decisions and sources

Accepted user plan in this session. Baseline: Handbook
71891a9031eeebee1ff8d2a66494bdeb10ad5d3f (provenance, not a runtime pin).
Existing work policy, consumer adapters and task authority remain controlling.

## Dependencies and constraints

Native client availability and publication are separate from local implementation.
No automated paid evaluations, external writes or new dependencies are implied.

## Open decisions and readiness

Implementation contract is ready. Codex runtime acceptance and Claude review and authorized
publication/merge are explicit gates for Unibase migration. Missing evidence must
remain pending, not be inferred from static tests or this ongoing session.
