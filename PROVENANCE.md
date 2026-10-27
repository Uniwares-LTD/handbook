# Provenance and retained notices

Five skills and the implementation/reviewer contracts were adapted from Uniwares-LTD/unibase.
[The import record](provenance/imports.json) retains the exact source revision, prior
source identities, source references and upstream records. It also retains pre-adaptation
file hashes; current files are recorded separately in [skills-lock.json](skills-lock.json).

Imported skill directories retain their bundled UI metadata and the learning template.
No LICENSE or NOTICE files existed in these five selected source directories; no such
files were removed. The source provenance includes karpishe-experiments/agentic-poc
and core-agent-skills v0.4.0. This private adaptation does not assert a new third-party
license. Do not publish these resources publicly without reviewing their source rights.
The manage-issues skill and handbook-specific policy/helpers are newly authored here.

Changes remove application-specific assumptions and align issue updates with member-led
acceptance. Four reusable framework/UI skills are now also imported with their resources
and notices in [the technology import record](provenance/technology-imports.json).
This preserves their original provenance and pre-adaptation hashes; Unibase is unchanged
until the Handbook changes are reviewed and merged. The generic launcher is derived
from Unibase's scripts/handbook.mjs at that recorded revision. System-owned skills
are neither copied nor modified. Refresh current hashes only after reviewing intended
changes: `node scripts/check.mjs --write-lock`, then `npm run validate`.

## Adoption decisions

Record each decision when adopting guidance from an outside source: Already covered,
Adopt, Adapt, Reject or Defer, with the evidence and, for Defer, the trigger to revisit.
Copy mechanisms in the handbook's own words; record the source revision reviewed.

### Jason-Richter-Enterprises/voxr-ai-app at acdbd0cea055 (2026-10-27)

Reviewed read-only for generic practices. Rules were rewritten in handbook style; no
source text, scripts or skills were copied.

| Practice | Decision | Where |
| --- | --- | --- |
| When to ask, audience profiles, plain writing, workflow adherence | Adapt | docs/guidance/communication.md |
| Abstraction threshold, behavior preservation, evidence types, per-task exceptions, performance avoid-list | Adapt | docs/guidance/engineering.md |
| Validation cadence and evidence reuse | Adapt | docs/guidance/engineering.md; implementation contract already had a ledger |
| Fresh-context review, verdicts, tiers, blocking bar, re-plan routing | Adapt | review-change, reviewer contract |
| Diagnose after two consecutive blocked review rounds | Adapt (no fixed budget) | work-on-task |
| Non-consent list, separate authority, selection-only authority | Adapt | docs/work-policy.md |
| Exact refspecs, no force-push, SHA match before evidence | Adopt | docs/work-policy.md |
| Generated-guidance and temporary-rule hygiene, archives not authoritative | Adopt | docs/work-policy.md |
| Triage rubric, next-issue ranking, board review report, priority vs severity | Adapt | manage-issues reference, work policy |
| User-facing documentation rules | Adapt | sync-docs-issues |
| Task routing table, scoped instruction files | Adapt | docs/project-guidance.md |
| Before/after deployment PR sections | Adopt | PR template |
| Gated-command list generated into tool permissions | Adapt | .agents/gated-commands.json, handbook:sync |
| Guidance CI, catalog parity, tool-neutral wording, description budget, empty-source guard | Adapt | .github/workflows, scripts/check.mjs, scripts/handbook-integration.mjs |
| Model A/B guidance evaluations | Adapt as principles only | docs/guidance/engineering.md |
| Thin CLAUDE.md importing AGENTS.md, generated wrappers | Already covered | docs/onboarding.md |
| Fixed correction budget | Reject | Conflicts with diagnose-and-ask decision |
| Weighted change-surface scoring, locked plan hashes | Reject | Ceremony without quality gain |
| Exact-phrase contract lint | Reject | Edit friction |
| Status digest skill | Defer | Revisit when a team asks for recurring updates |
| Product, support, analytics, stack-specific and release-topology guidance | Reject | Business-specific |
