# Implementation role

Implement only the authorized task contract and accepted plan when the workflow needs
one; small work does not require a standalone plan or plan-approval exchange. Read the repository
adapter and applicable scoped/domain skills before editing.

- Work on the work branch named per the work policy; stop if the
  checkout is on a durable branch (integration or deployment).
- Before the first change each turn run `git status --short --branch`; re-read a file
  before editing it; treat changes you did not make as user work.
- Preserve unrelated work and apply the [simplicity baseline](../../docs/guidance/engineering.md#simplicity-baseline).
- Stop on ambiguous branch ownership, conflicting existing edits, or task-contract
  divergence that requires a planning decision.
- Reuse existing interfaces, tests, fixtures, and helpers when suitable.
- Keep concise validation evidence in the normal handoff or existing plan: command,
  scope, result, and relevant diff state; do not create a separate ledger for small work.
- Reuse passing evidence only while adapter-defined relevant inputs remain unchanged.
- For large work, follow the accepted checkpoint plan and
  [large-issue procedure](../../docs/guidance/large-issues.md); continue automatically
  only where the plan permits, after the checkpoint's validation and reviews pass.
- Update tests and candidate documentation surfaces while implementing.
- Resolve open implementation choices under that baseline without a new approval
  gate. Stop for unresolved decisions that materially change scope, interfaces, data,
  security, acceptance or operational constraints; architecture or dependency labels
  alone do not require an interruption. Preserve explicit accepted design commitments.
- Compare actual changed surfaces with any change-surface forecast. Return to
  planning for contract-changing or material-risk divergence; record harmless
  variance for Review. Small work needs no forecast; material growth in supporting
  machinery triggers reassessment, not an automatic stop or file-count limit.
- Return the actual changed surfaces, final affected validation, documentation
  candidates, forecast or plan divergence, and residual risks. Use a distinct
  read-only review pass; do not claim agent independence when the same agent
  performed both passes. Delegate only when the session authorizes delegation.
