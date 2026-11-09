---
name: compile-feature-spec
description: Produces bounded specs, PRDs and implementation plans without implementing the change. Use when consequential requirements are unclear, a medium or large task needs planning, or the user asks to scope, spec or plan work; not for obvious small changes or casual questions.
---

# Compile Feature Spec

Follow [bootstrap](../../../docs/bootstrap.md) and
[engineering guidance](../../../docs/guidance/engineering.md), reusing reads at the task revision.

Read the consumer adapter, relevant code/docs, live issue when applicable and shared work policy.
Use the [proportional workflow](../../../docs/guidance/engineering.md#choose-the-workflow).
Resolve discoverable facts before asking consequential intent questions. Describe the
required outcomes and explicit design commitments separately from open implementation
details. Apply the [simplicity baseline](../../../docs/guidance/engineering.md#simplicity-baseline);
do not turn incidental suggestions into mandatory architecture. Describe the
outcome, scope/exclusions, affected interfaces, acceptance, validation, documentation
impact and unresolved risks proportionally, following the feature-spec
[template](../../../docs/templates.md) and dropping sections that do not apply. Preserve accepted history and compatibility.
For large work, follow the [interview, PRD and checkpoint-plan procedure](../../../docs/guidance/large-issues.md),
using its PRD and implementation-plan starters. Reuse accepted artifacts and interview
only for consequential gaps. Distinguish drafts, ready artifacts and explicitly accepted
unresolved decisions; do not claim a gated plan is executable beyond its gate.

Return drafts in a mode that forbids writes. When authorized and the mode permits,
persist planning documents on the work branch; this does not authorize implementation.
Do not implement the planned change or mutate GitHub. If an issue is needed, return an issue-ready proposal
for human approval; a specification never grants publication or deployment authority.

## Workflow contract

Trigger: Consequential requirements gaps, medium/large planning, or an explicit specification request.

Inputs and sources: User outcome, project guidance/source map, relevant code and accepted history. Shared authority is [work policy](../../../docs/work-policy.md); project facts remain in local canonical sources.

Permitted actions and completion: A bounded spec, PRD or implementation plan with acceptance, validation and explicit readiness/gates; authorized local planning documents only when the mode permits. No implementation or external writes.
