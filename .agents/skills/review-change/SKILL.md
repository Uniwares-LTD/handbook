---
name: review-change
description: Review a proposed code or documentation diff read-only against its contract, acceptance and verification evidence.
---

# Review Change

Read [bootstrap](../../../docs/bootstrap.md) for the task baseline and authority,
then relevant [domain guidance](../../../docs/guidance/README.md).

Read the consumer adapter, complete diff against its intended base, live acceptance
criteria, relevant implementation and current evidence. Follow [the reviewer contract](../../agents/reviewer.md).
Report actionable correctness, compatibility, scope, security, documentation and stale
verification defects with precise evidence and bounded corrections. Keep preferences
non-blocking. Return Pass when no actionable defect remains; missing evidence still
limits the claim. For risky/cross-cutting work compare actual surfaces with the plan.
Remain read-only: no edits, comments, publication or project/issue mutations. Distinguish
a separate pass by the same agent from genuinely independent-agent review.

## Workflow contract

Trigger: Reviewing a proposed change against its contract.

Inputs and sources: Final diff, acceptance, local guidance/source map and verification evidence. Shared authority is [work policy](../../../docs/work-policy.md); project facts remain in local canonical sources.

Permitted actions and completion: Actionable findings or an explicit no-findings result with verification limits; no implementation changes during review.
