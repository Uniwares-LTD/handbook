---
name: sync-docs-issues
description: Updates canonical documentation, the source map and issue evidence to match verified work. Use after a change is implemented and reviewed, or when docs, links or issue evidence are out of date.
---

# Sync Docs Issues

Read [bootstrap](../../../docs/bootstrap.md) for the task baseline and authority,
then relevant [domain guidance](../../../docs/guidance/README.md).

Read the consumer adapter, final diff, review, acceptance criteria and validation.
Update the nearest canonical documentation for changed behavior, setup, interfaces,
constraints and procedures; otherwise give a concise no-change rationale. Link rather
than duplicate changing facts. Preserve historical evidence separately from current
guidance. Check paths, commands, links and generated catalogs named by the adapter.
Write issue evidence in the issue language from the repository preferences.
For authorized assigned work in an adopted repository, re-fetch the issue and publish
concise evidence without overwriting human edits or duplicating comments. State outcome,
checks, documentation, reviewed revision and remaining acceptance. Do not rewrite scope,
create follow-ups, accept/cancel or close issues. Verified closure mirroring belongs to manage-issues. New issue proposals require human approval.
Use capture-project-learnings only for useful verified reusable knowledge. Use
maintain-docs to start a new document or refresh templates.

For user-facing guides, write from what actually shipped. When a decision changes,
rewrite the affected journey instead of adding a correction. Leave out abandoned
proposals and issue, PR or review history. Test each sentence: would a reader who never
saw the planning discussion still need it?

## Workflow contract

Trigger: A change affects canonical documentation, navigation or assigned issue evidence.

Inputs and sources: Verified diff, acceptance, local guidance/source map and current issue state when applicable. Shared authority is [work policy](../../../docs/work-policy.md); project facts remain in local canonical sources.

Permitted actions and completion: Updated canonical facts and source-map links, or a no-change rationale, with verification limits; no invented facts or terminal issue transitions.

Maintain the project-owned source map when components, canonical references, command
definitions, generated boundaries or ownership change. Reconcile broken links and
contradictions proportionately; mark unknowns rather than inventing completeness.
