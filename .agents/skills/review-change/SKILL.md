---
name: review-change
description: Reviews a code or documentation diff read-only against its task contract, acceptance criteria and verification evidence. Use when asked to review a change, branch, PR or diff, or after implementing and before handoff.
---

# Review Change

Follow [bootstrap](../../../docs/bootstrap.md) and
[engineering guidance](../../../docs/guidance/engineering.md), reusing reads at the task revision.

Read the consumer adapter, complete diff against its intended base, live acceptance
criteria, relevant implementation and current evidence. Follow [the reviewer contract](../../agents/reviewer.md).
Apply its simplicity acceptance rule even without ponytail; distinguish open
implementation decisions from explicit accepted design commitments before grading.
Report actionable correctness, compatibility, scope, security, documentation and stale
verification defects with precise evidence and bounded corrections. Keep preferences
non-blocking. Return Pass when no confirmed Blocking findings remain and required
verification is current; otherwise report Blocking findings or incomplete verification.
For risky/cross-cutting work compare actual surfaces with the plan.
Remain read-only: no edits, comments, publication or project/issue mutations. Distinguish
a separate pass by the same agent from genuinely independent-agent review.

When the client supports it and the session authorizes delegation, collect raw findings
in a fresh context given the diff, base, acceptance criteria, repository guidance and
access to relevant source, without the implementation summary, plan or earlier findings.
The generated read-only `reviewer` subagent serves this where supported. Otherwise label
the result "cold-review fallback". After raw collection, read the plan and verification
evidence to check scope and acceptance; this second phase is part of the same review
pass, not a second clean review. Then verify each finding
against the code and give it one verdict (Confirmed, Plausible, Pre-existing, Not
confirmed) and one tier (Blocking, Medium, Informational) as the reviewer contract
defines. Report Not confirmed findings only as discarded.

The [workflow](../../../docs/guidance/engineering.md#review-completion) determines
the required pass count. Review stays read-only; return findings to implementation for
fixes. Record the reviewed state and evidence without creating extra issue comments.

## Workflow contract

Trigger: Reviewing a proposed change against its contract.

Inputs and sources: Final diff, acceptance, local guidance/source map and verification evidence. Shared authority is [work policy](../../../docs/work-policy.md); project facts remain in local canonical sources.

Permitted actions and completion: Verified findings and Pass or incomplete/blocked review with verification limits; no implementation changes during review.
