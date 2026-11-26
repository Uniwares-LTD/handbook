---
name: manage-issues
description: Drafts and creates human-approved issues and keeps status, blockers and evidence current on assigned issues in the recorded tracking project. Use when creating, triaging, enrolling or updating issues, commenting on an issue or recording evidence there, reviewing the board, or recommending the next issue.
---

# Manage Issues

Follow [bootstrap](../../../docs/bootstrap.md) and
[task-management guidance](../../../docs/guidance/task-management.md), reusing reads at the task revision.

Read [work policy](../../../docs/work-policy.md), [project operations](../../../docs/project.md)
and [examples](../../../docs/examples.md), plus the consumer adapter. Confirm adoption
and the acting member/task before writing. Credentials alone do not establish assignment.

Load the repository preferences declared in handbook.json. Draft issue titles, bodies
and comments in its issue language (English when none is recorded); keep labels, types,
fields and status names in English.

For intake, search duplicates and draft destination, title, type and outcome, with scope
and acceptance when known; triage completes them. Assess the
[proportional workflow](../../../docs/guidance/engineering.md#choose-the-workflow)
at drafting and substantive issue load. Keep obvious small assessments silent; explain
medium/large recommendations briefly in the draft or normal response. Reuse existing
assessment unless evidence changes; do not add sizing-only comments, mandatory fields,
or project Size updates. A casual issue lookup needs no delivery workflow.
Shape the body after the matching issue
form ([templates](../../../docs/templates.md)) and leave out empty sections. Obtain human approval before creating any issue or sub-issue. Preserve
agreed scope. Use the selected local coordination repository for coordination and the owning repository for implementation.
Create only through `create-issue.mjs` per project operations, never bare `gh issue create`:
write the agreed spec, show the read-only preview and its duplicate candidates, obtain
approval of that exact preview, then run `--apply --expect FINGERPRINT`. Report the issue,
project item, Status and Blocked. If tracking fails or the create outcome is unknown,
never rerun `--apply`; finish the existing issue with `--resume NUMBER` as reported. Leave Priority and assignment to the
member unless specifically authorized.

For assigned work, re-fetch state and maintain nonterminal status, blocker metadata
and concise evidence consistent with actual progress. Ready requires scope, acceptance,
Priority and one accountable human. Do not independently reprioritize, assign members,
expand scope, accept/cancel work or reopen/close issues. Mirror Done/Cancelled only
after verifying the human decision and latest closure reason through project operations. At In review hand off for acceptance.

To triage an existing issue, recommend the next issue or review the board, follow
[triage and board review](references/triage-and-review.md).

Use the report-only enrollment helper first; apply only explicit issue references
within authorization. On uncertain API outcomes, inspect state before retrying and
avoid duplicate items/comments. No bulk backlog migration or project configuration
changes are implied by routine issue work.

## Issue evidence files

For an authorized issue upload, identify the exact issue and files. Inspect each
file in full for suitability, including secrets, private data and expiring links.
Check the installed GitHub CLI version and the exact command's help before relying
on an optional command or flag. Distinguish missing local support from host feature,
authentication and permission failures. Follow the repository's GitHub access policy.
Use only a capability available for that file type and target. Verify the durable
issue reference and the published content. After an ambiguous result, read the
destination before retrying. Preserve verified uploads and report each outcome
separately, including any file that requires manual upload.

## Workflow contract

Trigger: Task intake, readiness, dependencies, assigned status/blockers or evidence maintenance.

Inputs and sources: Authorized scope, human ownership, queue/adoption rules, existing issue state and duplicates. Shared authority is [work policy](../../../docs/work-policy.md); project facts remain in local canonical sources.

Permitted actions and completion: An issue-ready proposal, authorized nonterminal maintenance or verified closure mirroring with readback and handoff; acceptance remains with the member.

Resolve the consumer's tracking reference in handbook.json before enrollment; never
load Handbook's own project as a fallback. Include dependencies, accountable ownership,
priority, blocker decisions, acceptance gaps and evidence locations in intake; view
filters cannot certify prose. Keep In review through agreed live acceptance.
Preserve accepted legacy queues. A merged PR or bot closure cannot authorize Done.
