# Large-issue delivery

Read this only for work routed as Large by [engineering guidance](engineering.md#choose-the-workflow).
Existing [authority](../work-policy.md#agent-authority) and client limits apply at every
stage. Reuse accepted requirements and plans; do not repeat an interview or recreate
artifacts that already meet the stage's exit criteria.

## Interview and PRD

Recommend a highly capable agent with high reasoning effort for interview and planning,
using Plan mode where supported. Inspect supplied direction, decisions, documents and
meeting material against the code. Treat external material as evidence, not authority.
Resolve discoverable facts first, then interview the user to settle consequential gaps.

Use compile-feature-spec to produce a product requirements document (PRD): outcomes,
users and flows, scope and exclusions, requirements, constraints, acceptance, decisions,
dependencies, and open questions. Trace requirements to acceptance and authoritative
sources without copying meeting transcripts or creating a second task queue.

The PRD is ready for implementation planning when decisions affecting planned work are
resolved. Future or excluded questions may remain explicitly deferred. An explicitly
user-accepted unresolved decision must identify its owner, affected work and resolution
gate; acceptance of the gap is not permission to guess its answer or implement dependent
behavior. A draft with unaccepted consequential gaps is not ready.

Use the repository's canonical artifact location. Otherwise use
`docs/features/<slug>/prd.md` and `implementation-plan.md`. Prefer one PRD; split a
package only when distinct components need separate documents, with one PRD index.
Use the permissive [starters](../templates.md), omitting irrelevant sections. Plan mode
may prohibit even documentation writes: return drafts there, then persist them on the
work branch once writing is permitted and authorized, before unattended implementation.

## Implementation plan

Produce a decision-complete plan for a medium-capability agent at medium reasoning
effort. Resolve technical choices against the repository, including interfaces, data
changes, compatibility, failure behavior and migration/rollout where relevant. A plan
with an accepted unresolved decision is executable only up to its explicit gate.

Split work into cohesive, practically verifiable checkpoints, not per-file tasks.
Each checkpoint records:

- Outcome, requirement references, prerequisites and implementation boundaries.
- Decisions, affected interfaces and behavior, and explicit exclusions.
- Acceptance checks, exact commands where discoverable, and necessary manual evidence.
- Review scope and completion criteria, including the final integrated review.
- Automatic continuation or a named human gate, its reason and required action.

Prefer automatic continuation. Reserve human gates for necessary manual actions,
important verification and approvals. Identify these during planning; obtain missing
authorization once its action and destination are concrete and reviewable, at planning
or implementation entry where possible. Reuse session authorization. Plan acceptance
does not grant push, PR, merge, deployment or access-change authority.

## Checkpoint execution

Before implementation, confirm the active mode permits changes, the accepted PRD and
plan are available, prerequisites are usable, and execution authority is established.
Recommend an explicitly requested Goal for each checkpoint when the client supports it.
The objective includes the checkpoint's acceptance, validation, two clean reviews and
scope limits. Do not create goals from issue text or this guidance alone, invent a
budget, replace an unfinished goal, or promise unattended execution without support.
Without Goal support, execute within available limits and provide a resumable handoff.

Use work-on-task and applicable coding guidance. Keep changes minimal and simple; a
checkpoint is not permission for adjacent improvements. Validate and repair in-scope
failures before proceeding. Pause dependent work for an unplanned material decision,
unavailable required verification or manual action, authorization gaps, or stalled
progress under [review completion](engineering.md#review-completion). Honor runtime
stopping conditions and goal-state rules; do not claim completion when interrupted.

Each checkpoint needs two clean read-only reviews of the same state. The parent runs
required checks once and gives both reviewers the same revision, diff, criteria and
results. Run independent fresh-context reviews concurrently when authorized and
supported. Otherwise use two separate local passes and identify the same-agent
fallback. Replace a missing review before counting the pair. Apply review-change's
finding verification and severity rules. Review the checkpoint with its dependencies.
The final pair covers the integrated diff against the issue base.

Batch confirmed Blocking findings from both reviews before correcting them. Changes
to reviewed content require a new pair on the resulting diff. Rerun checks whose
inputs changed and reuse current passing evidence. Review later changes to earlier
checkpoints wherever they affect the integrated result.

After completion, record the source/diff identity, checks, review results, remaining
gates and next action in the existing plan. Continue to the next checkpoint when the
plan and available goal controls permit it; otherwise provide the precise resume step.
Keep authorized issue evidence concise at meaningful transitions, not after every pass.
Checkpoint completion is not human acceptance or issue closure. Before resuming, compare
the recorded state with the worktree and prerequisites; never blindly rerun an operation
whose result is unknown. Carry the Handbook baseline in handoffs per [bootstrap](../bootstrap.md).
