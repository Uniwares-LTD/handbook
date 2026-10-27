---
name: manage-issues
description: Prepare approved issues and maintain assigned issue/project tracking in the consumer organization under human-controlled acceptance.
---

# Manage Issues

Read [bootstrap](../../../docs/bootstrap.md) for the task baseline and authority,
then relevant [domain guidance](../../../docs/guidance/README.md).

Read [work policy](../../../docs/work-policy.md), [project operations](../../../docs/project.md)
and [examples](../../../docs/examples.md), plus the consumer adapter. Confirm adoption
and the acting member/task before writing. Credentials alone do not establish assignment.

For intake, search duplicates and draft destination, title, type, outcome, scope and
acceptance. Obtain human approval before creating any issue or sub-issue. Preserve
agreed scope. Use the selected local coordination repository for coordination and the owning repository for implementation.
After approved creation, enroll the issue and set Blocked explicitly; leave Priority
and assignment to the member unless specifically authorized.

For assigned work, re-fetch state and maintain nonterminal status, blocker metadata
and concise evidence consistent with actual progress. Ready requires scope, acceptance,
Priority and one accountable human. Do not independently reprioritize, assign members,
expand scope, accept/cancel work or reopen/close issues. Mirror Done/Cancelled only
after verifying the human decision and latest closure reason through project operations. At In review hand off for acceptance.

Use the report-only enrollment helper first; apply only explicit issue references
within authorization. On uncertain API outcomes, inspect state before retrying and
avoid duplicate items/comments. No bulk backlog migration or project configuration
changes are implied by routine issue work.

## Workflow contract

Trigger: Task intake, readiness, dependencies, assigned status/blockers or evidence maintenance.

Inputs and sources: Authorized scope, human ownership, queue/adoption rules, existing issue state and duplicates. Shared authority is [work policy](../../../docs/work-policy.md); project facts remain in local canonical sources.

Permitted actions and completion: An issue-ready proposal, authorized nonterminal maintenance or verified closure mirroring with readback and handoff; acceptance remains with the member.

Include dependencies, readiness gaps, accountable ownership and evidence locations
in intake. Preserve explicitly accepted legacy queues; search before proposing a
duplicate. External project proposals are optional, never a prerequisite to local work.

Resolve the consumer's tracking reference in handbook.json before enrollment; never
load Handbook's own project as a fallback. Reuse the recorded choice and local mappings.
Inventory missing priority, accountable ownership, blocker decisions and acceptance gaps;
view filters cannot certify prose. Keep In review through agreed deployment/live acceptance.
Use report-first closure reconciliation with explicit human decision evidence. A merged
PR, bot closure or authenticated account alone cannot authorize Done/Cancelled.
