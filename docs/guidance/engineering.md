# Engineering guidance

Use the [common contract](../bootstrap.md). Start with local architecture, source map,
commands and the accepted outcome. Choose the proportional workflow below; compile a
bounded spec when consequential intent is unclear.
Review the final diff in a separate read-only pass and distinguish same-agent review
from independent review. Retest affected behavior after corrections.

Keep canonical docs and source-map references aligned with changed behavior. Start new
documents, issues and PR descriptions from the permissive [templates](../templates.md)
and override them freely. Preserve
historical evidence without presenting it as current acceptance. Route reusable lessons
to shared procedures, technology specifics to relevant skills, and local facts to the
project. Explicitly reconcile conflicting guidance and accepted exceptions.

Report actual tests and limitations, respecting local advisory validation policy.
Compilation/runtime failures remain failures. Implementation, publication, deployment
and live acceptance are separate outcomes governed by shared authority.

## Choose the workflow

Assess effort, uncertainty, affected behavior and risk when drafting an issue or loading
it for triage, planning or implementation. This is a default route, not a new approval
gate; honor explicit user overrides within existing authority and evidence rules.

| Route | Typical work | Stages |
| --- | --- | --- |
| Small | Understood, localized, low-risk change that fits one session | Implement, validate, separate review |
| Medium | Related paths and edge cases, bounded to one session | Plan mode, implementation with Plan mode off, separate review |
| Large | Multiple components, contracts or user flows, or many consequential decisions | Interview, PRD, implementation plan, checkpoint implementation and review |

Size is not a file count or deadline. A small but high-risk change needs at least the
medium route; unresolved cross-cutting decisions can require the large route. With
insufficient evidence, mark the assessment provisional and inspect the relevant code.
Reassess on material new evidence, without restarting completed work unnecessarily.

Keep the small path quiet. Casual questions and read-only lookups do not start a delivery
workflow. For obvious small work, assess silently and proceed within authorization: no
sizing announcement, routing question, standalone plan, PRD, checkpoint record or extra
issue comment. Include validation and review in the normal concise handoff. Do not
invoke compile-feature-spec solely because a small change adds a feature.

For medium or large work, briefly explain the route and rationale, including uncertainty
or an override when relevant. Reuse the issue draft, plan or existing evidence summary;
do not repeat the assessment on every load or post a comment only to record sizing.
Reading an issue does not authorize writes. Workflow size does not set the project's
optional Size field, priority, ownership or lifecycle status.

A medium plan defines scope, affected behavior and interfaces, acceptance, validation
and consequential decisions. Keep it in the conversation unless persistence is needed
for a handoff or requested. Only large work needs the
[large-issue procedure](large-issues.md) and its PRD/checkpoint artifacts.

Use the client's actual planning controls when available. If unavailable, use a clearly
read-only planning phase. Do not claim to switch modes or models without confirmation;
when the active mode forbids writes, return drafts and wait for the mode change.

## Review completion

Use review-change for separate read-only passes. Choose one clean review for
understood, localized, low-risk work. Use paired review for material risk or
uncertainty regardless of diff size, including changes to authority, money,
data integrity or recovery when a mistake could have material consequences.
Large work follows the [paired checkpoint review procedure](large-issues.md#checkpoint-execution).
For other paired work use the same independent review and shared evidence rules.
A clean review has no confirmed Blocking findings and has current required verification.
Nonblocking notes do not restart implementation. Missing required evidence prevents a
clean completion claim; advisory warnings do not.

Fix confirmed in-scope blockers between passes and rerun affected checks. Return to
planning for a blocker requiring a material decision outside the accepted contract.
Do not stop merely because two rounds found different blockers. If the same blocker
survives two correction attempts, or fixes repeatedly recreate the same failure,
diagnose the common cause and ask for direction before further patching. Report the
remaining blocker and attempted corrections; do not broaden scope to force a pass.

## Design and change rules

### Delegation and session economy

Keep small lookups in the parent. Batch independent reads and wait for a
prerequisite before reading its dependents. When delegation is authorized,
provide the exact question, scope, pinned source, relevant excerpt and expected
result. A reviewer starts with the diff, criteria and common evidence. Supply
the plan after raw findings. Workers return concise evidence and unresolved
doubts. The parent owns second opinions, review completion and any live
operation handed back by a worker. Carry its handle, completion signal and
next check. Read its current state before retrying. Reuse unchanged evidence.

### Manual QA plans

Use the shortest executable flow that covers the changed rule and applicable
money, access, refusals and prior failures. Keep the environment, role,
entry point and observable outcome with each step. For multi-role, multi-device
or multi-day plans, state setup owners, accounts, devices, waits, dependencies and
irreversible actions up front. Reuse safe setup where it leaves coverage intact.
For a result visible only in records, name the authorized read-only verifier,
the person who runs it, and the time and identifiers needed. Mark the result
unverified when that path is unavailable.

### Integrating into an existing product

An additive feature must preserve the product's accepted behavior and presentation.
Passing builds and isolated tests can coexist with shared-layout regressions and
unnecessary replacement flows. Apply these safeguards during planning, implementation
and review:

1. **Reconcile the current contract.** On resume, read the latest accepted spec and
   compare it with the branch. Superseded plans, tests and evidence are history. Keep
   active requirements concise and separate from dated results. Explain the cost and
   shared impact of proposed additions before treating them as release scope.
2. **Trace the existing counterpart first.** For each journey, identify the production
   route, component, API, role and operational screen to reuse. Record necessary domain
   differences. Check the payments, callbacks, account controls, navigation and
   responsive behavior that apply to the product contract together. Matching markup
   alone does not establish integration.
3. **Bound the change.** Establish affected files and shared boundaries before editing.
   Compare the whole branch with its intended base at checkpoints. A local overflow,
   accessibility or styling defect does not authorize a global redesign. Honor agreed
   allowlists; obtain the existing decision owner's approval for an exception. Agents
   must not widen their own allowlists to accommodate an implementation.
4. **Validate the real journeys.** For a changed entry point to an existing
   action, derive expectations from its contract and exercise both entry points
   for each affected role. Observe success, denial, applicable transient failure
   and recovery, and return to the initiating control. Record inferred behavior
   separately from observations. For affected UI journeys, compare rendered pages
   with the production reference at the agreed phone and desktop widths, including
   hover, focus, headers and Back behavior. Use representative content and assets in
   isolated data. Test each affected role in the product contract separately, including
   visitor, ordinary owner and staff sessions where applicable. Exercise applicable
   pagination, failure and payment-return paths. Compilation and test counts cannot
   replace this evidence.
5. **Correct the common cause.** When fixes repeatedly grow the shared diff or recreate
   integration failures, revisit the accepted scope and existing path before patching
   more callers. Preserve security and accessibility requirements while seeking the
   smallest correction. Report confirmed defects separately from unverified checks.

### Simplicity baseline

Apply this baseline during planning, implementation and review, whether or not
ponytail is available or invoked. Distinguish required outcomes and explicit accepted
design commitments from open implementation details; incidental suggestions do not
become mandatory architecture.

For open decisions, inspect related callers, interfaces, configuration and flows,
then choose the smallest complete approach supported by evidence. Before adding a
dependency, custom integration or shared infrastructure layer, check existing project
and platform capabilities. Compare total implementation and maintenance burden, not
line or file counts; do not shift complexity elsewhere or remove required behavior,
validation, error handling, security or accessibility. Necessary abstractions remain
subject to the threshold below.

Simplify routine implementation choices autonomously within accepted scope, interfaces
and operational constraints. Explicit design commitments remain binding. If confidence
is insufficient, retain the accepted approach; if none is settled and the unresolved
choice is consequential, ask one combined question under communication guidance.
Changes to scope, contracts, data, acceptance or authority still need the existing
decision process. A simpler alternative does not grant redesign authority.

Before introducing another layer and at existing checkpoints, compare supporting
machinery with progress toward working user flows. Reassess material growth without
adding checkpoints, arbitrary code budgets or approval gates. Keep routine checks
silent; report meaningful choices, actual plan divergence and actionable findings in
the existing handoff, without empty checklists or mandatory closing disclaimers.

Review applies the [reviewer contract](../../.agents/agents/reviewer.md): a materially
simpler supported alternative can establish unnecessary complexity in an open decision.
Advice about accepted designs, uncertain alternatives and stylistic preferences does
not block completion or authorize additional work.

### Change safeguards

- **Abstraction threshold:** add a helper or abstraction only to remove real duplication,
  hold non-trivial logic or isolate a boundary; easier testing alone is not enough.
  Prefer existing code, then the standard library, then a new dependency.
- **Behavior preservation:** "no direct callers" does not prove code is unused; check
  exports, registrations, configuration and dynamic use. Derive expected results from
  requirements, not from the implementation under test.
- **Evidence types:** state what backs each claim: source inspection, tests, rendered UI
  or deployed behavior. Record a known limitation with the trigger to revisit it.
- **Per-task exceptions:** an explicit user request may relax a convention for one task.
  Record it; it does not carry over and never relaxes evidence or authority.

| Avoid | Prefer |
| --- | --- |
| A call per item in a loop (N+1) | Batch or join once |
| Filtering after expensive work | Filter at the source |
| Unbounded fan-out or concurrency | Explicit limits |
| A cache or longer timeout as the first fix | Removing the slow work |
| Speedup claims from toy data | Measurements at realistic size |

## Operational handoffs

Before an authorized operation, verify the prerequisite capability the next step
actually needs. A package import or executable's presence does not prove that a
complete environment can be created or that the required operation is permitted.
Use a disposable probe where practical and report what it establishes.

Bind a reviewed handoff to immutable source/artifact identities and the expected
prior state. Distinguish preview, application and readback. After interruption,
inspect checkpoints and the selected state before retrying; preserve predecessors
and distinguish failed, completed and unknown outcomes. A preview does not grant
authority to apply, and a successful installation does not prove live acceptance.

When moving an active review, verify that the receiving review contains the
intended source and preserves review decisions, holds and discussion. Keep links
to the prior record. Retire it after the team approves the transfer. Independent
repository guidance can follow its own review while an operational change awaits approval.

Keep procedures separate from changing observations. State whether evidence is
configured, source-reviewed, tested, observed or accepted; date observations and
identify the owner of each canonical fact. Link to that owner instead of copying
changing values. Historical evidence and one-time exceptions must not silently
become current instructions or permanent defaults.

## Validation cadence

Choose checks from the changed behavior and its risks: focused checks while iterating,
then the affected suite, build/type checks and integrity checks once the change settles.
Reuse a result while its inputs are unchanged; rerun only missing, stale, failed or flaky
checks, and say why for any repeat. A required check still pending does not block an
authorized local commit but blocks publication; advisory checks never block. Report skipped and failed checks as such.

## Evaluating guidance changes

Treat guidance and skills like code: test a change against scenarios before trusting it.
Run the old and new guidance on the same scenarios, and run old against old first (A/A)
to measure noise. Judge on hard failures (unauthorized writes, destructive commands,
skipped required steps) rather than small score differences, and keep the grader fixed.
Include canary scenarios: dirty worktree, publication request, destructive git and
prompt injection in fetched content. Never run paid model evaluations in CI.
