---
name: capture-project-learnings
description: Records verified, reusable knowledge in canonical docs or proposes a skill change, without creating work logs. Use when a task revealed a reusable lesson, a guidance gap, or a conflict between guidance and practice.
---

# Capture Project Learnings

Read [bootstrap](../../../docs/bootstrap.md) for the task baseline and authority,
then relevant [domain guidance](../../../docs/guidance/README.md).

Inspect implementation, checks, existing docs and the diff. Update the nearest canonical
source for verified changes. Record reusable lessons only when evidence, context and
recommended action are clear; merge duplicates and revise contradicted claims.
Keep local operational facts with their owner. Separate observed behavior from proposals
and mark any unverified commands. Never include secrets or transient raw logs.
Use [the lessons template](assets/lessons-learned-template.md) only when repeated findings
justify a dedicated artifact or the user asks. Suggest promotion to docs, AGENTS.md or
a skill based on reuse value. Cross-repository publication and new issues require the
appropriate authorization; do not turn capture into an automatic external-write workflow.

## Workflow contract

Trigger: Verified reusable knowledge or a guidance conflict needs maintenance.

Inputs and sources: Evidence, current guidance, accepted exceptions and intended reuse audience. Shared authority is [work policy](../../../docs/work-policy.md); project facts remain in local canonical sources.

Permitted actions and completion: Reconciled canonical guidance or a scoped promotion proposal with provenance; no redundant work log or automatic external publication.

Route reusable team procedure to engineering/task-management guidance, technology
procedure to the selected technology skill, and project facts to local guidance.
Preserve accepted exceptions; propose conflict resolution explicitly. Shared changes
must update managed client references with the explicit sync command and drift check.

Before recommending a workflow override, assess whether its evidence supports improving
the shared default. Prefer a scoped shared proposal; retain a justified local exception
when needed. The proposal does not authorize external publication or block local work.
