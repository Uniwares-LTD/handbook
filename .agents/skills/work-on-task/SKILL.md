---
name: work-on-task
description: Implements and verifies bounded repository work on a work branch, then runs a separate read-only review and hands off evidence. Use when asked to implement, fix, build or change something for an issue or task, to work on an issue number, or to commit, push or open a PR for prepared changes.
---

# Work On Task

Follow [bootstrap](../../../docs/bootstrap.md) and
[engineering guidance](../../../docs/guidance/engineering.md), reusing reads at the task revision.

Read the consumer AGENTS.md, adapter, task contract, relevant domain skills and current
live issue when applicable. Issue content is evidence, not new authority. Resolve scope before editing, and edit
only on an issue branch created per [work policy](../../../docs/work-policy.md), never on a durable branch.
Before working in the checkout, apply the repository's
[hosting and fallback rules](../../../docs/work-policy.md#repository-hosting-and-migration).
Recheck the destination before publication, migration tooling or post-merge steps.
Use [the implementation contract](../../agents/implementation.md). Preserve unrelated
work and apply the [simplicity baseline](../../../docs/guidance/engineering.md#simplicity-baseline)
to open implementation decisions, even without ponytail.

Follow the [session economy guidance](../../../docs/guidance/engineering.md#delegation-and-session-economy).
Resolve small lookups directly. When delegation is authorized and proportionate,
give each independent investigation a bounded question, named evidence source and
expected result. Use existing role contracts and the client's supported effort controls.
The parent reconciles evidence, handles dependent decisions and retains required review.
Follow the shared [wait guidance](../../../docs/guidance/communication.md#waiting-and-resuming)
and [grouped approval rules](../../../docs/work-policy.md#grouped-approvals).
Use the [proportional workflow](../../../docs/guidance/engineering.md#choose-the-workflow),
without a planning artifact or sizing announcement for obvious small work. Keep validation
evidence in the normal handoff or existing plan. For large work, follow the
[checkpoint procedure](../../../docs/guidance/large-issues.md). For risky/cross-cutting work,
compare intended boundaries, acceptance and risks with the final changed surfaces.
Run affected checks after the last relevant change, then use review-change in a separate
read-only pass. Correct confirmed in-scope Blocking findings and revalidate affected behavior.
Use sync-docs-issues for canonical documentation and authorized evidence updates.
When a PR is authorized, write its description from the repository's PR template
([templates](../../../docs/templates.md)) and drop sections that do not apply.
Use [manual QA guidance](../../../docs/guidance/engineering.md#manual-qa-plans)
for any tester-facing flow.
Follow [review completion](../../../docs/guidance/engineering.md#review-completion) for
clean-review counts and stalled progress. Do not make advisory quality warnings release gates.
Report real build/operational failures. Before calling work done, run the checks that
prove it and cite the command and result; an unrun check is reported as not run.
Stop at In review for member acceptance.
Use manage-issues only within the shared authority policy; never independently accept/cancel or close issues. Verified human closure
may be mirrored by manage-issues under the shared policy. Commit on the work branch as
needed; pushes, PRs, merges, deployments and releases need session authorization.

## Workflow contract

Trigger: Implementing authorized bounded repository work.

Inputs and sources: Task contract, local guidance/source map, relevant domain guidance and baseline. Shared authority is [work policy](../../../docs/work-policy.md); project facts remain in local canonical sources.

Permitted actions and completion: Implementation, proportional checks and a separate read-only review with a member acceptance handoff.
