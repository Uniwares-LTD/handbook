# Work policy

## Authority and adoption

This policy applies to handbook and repositories that explicitly adopt it. A user
assignment authorizes work within its scope, not arbitrary work found in issues.
Repository adapters define local architecture, tests, operational boundaries, and
canonical documents. Reconcile contradictory local rules during adoption; do not
silently choose a weaker rule. System/developer instructions and explicit session
instructions remain controlling.

Issues own implementation and documentation queues after adoption. Documents retain
decisions, setup, architecture and verified evidence, linking to issues for pending
work. Historical documents are not a task queue. Small standalone low-risk fixes may
be untracked. Use one issue per meaningful outcome, not per file or commit.

## Ownership and lifecycle

| Stage | Meaning and entry criteria |
| --- | --- |
| Backlog | Proposed work; may lack priority, detail, or owner |
| Ready | Clear scope, acceptance criteria, Priority, and one accountable human assignee |
| In progress | Assigned member is actively working, possibly with an agent |
| In review | Implementation/research outcome and relevant evidence are ready for acceptance |
| Done | Human closed the issue; GitHub closure reason distinguishes completed from not planned |

Devs may triage, prioritize and self-assign. Changes to another member's ownership
must be coordinated. Admins handle reassignment/cancellation when needed. The assigned
member accepts completion and closes the issue. Reopened work returns to Backlog.
No automatic issue closure or Done transition on PR merge is permitted by default.
Use ordinary `Related to OWNER/REPO#NUMBER` references, not closing keywords in commits
or PR descriptions or Development links that auto-close on merge.

Blocked is independent of stage. Record the reason, next action and responsible person
in the issue; use native blocked-by relationships for issue dependencies. Update the
flag when the blocker clears. An empty flag on a newly enrolled issue means not yet
triaged; enrollment/triage explicitly sets Not blocked or Blocked.

## Agent authority

| Action | Authority |
| --- | --- |
| Read issue, inspect code, plan and verify | Within assigned task |
| Enroll existing assigned issue, maintain nonterminal status and blocker metadata, post evidence | Within assigned task in an adopted repository |
| Create issue or sub-issue | Suggest first; obtain human approval for concrete scope and destination |
| Assign a member, reprioritize, expand scope | Human decision; do not do independently |
| Close/reopen issue, mark Done, cancel work | Human member action |
| Commit, push, publish PR, merge, deploy, release, change access | Separate explicit session authorization |

Suggest discoveries with destination, outcome, scope, acceptance and known duplicates.
Do not create follow-up issues just because a skill recommends them. Re-fetch the issue
before updating it; preserve human edits, avoid repeated comments, and report blockers
without claiming unverified results. Do not rewrite agreed scope through a status update.
Authenticated credentials do not prove the agent represents the issue's assignee;
resolve the acting member from the assignment, not from the token username.

## Acceptance and review

Meet the issue's acceptance criteria; record relevant tests, documentation changes,
review findings and limitations. Perform a separate read-only review of the final diff.
Retest affected behavior after corrections. Quality warnings remain advisory; never
describe compilation, runtime or operational failure as success.
Distinguish local implementation, publication/merge, deployment and live acceptance.
If live acceptance is part of the issue, merging alone does not complete it. Do not
silently substitute a follow-up issue for an unmet criterion.

## Issue structure

Use native Task, Bug and Feature types. An Initiative is a Task with `initiative`
label and native sub-issues. `documentation`, `research`, and `operations` classify
Tasks; do not duplicate lifecycle/priority in labels. Cross-repository coordination
lives in handbook; implementation lives in the responsible repository. Search for
duplicates before proposing or creating work. Use sub-issues for independently owned
outcomes and checklists for small steps. Size is optional relative effort, not a deadline.
