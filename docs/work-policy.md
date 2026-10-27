# Work policy

## Authority and adoption

These shared defaults apply to Handbook and repositories that explicitly adopt them. A user
assignment authorizes work within its scope, not arbitrary work found in issues.
Repository adapters define local architecture, tests, operational boundaries, and
canonical documents. Reconcile contradictory local rules during adoption; do not
silently choose a weaker rule. System/developer instructions and explicit session
instructions remain controlling.

Repository issues are the default work queue after adoption; preserve explicitly accepted legacy queues and milestones. Documents retain
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
| Done | Human accepted completion and closed the issue as completed |
| Cancelled | Human closed without completion; retain not-planned/duplicate reason and references |

Local governance identifies who triages, prioritizes, assigns and accepts work; no team
names or permission model are implied. Keep one accountable human, allowing additional
contributors. Coordinate ownership changes. The authorized human accepts/cancels and closes. Reopened work returns to Backlog.
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
| Accept/cancel work, close/reopen issue | Human member action |
| Mirror Done/Cancelled after verified human closure | Authorized maintenance with closure reason and decision evidence; never independent acceptance |
| Create/configure/link external projects | Explicit authorization of a concrete preview; no implied access changes |
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

Prefer native Task, Bug and Feature types where supported; preserve or explicitly map local equivalents. An Initiative is a Task with `initiative`
label and native sub-issues. `documentation`, `research`, and `operations` classify
Tasks; do not duplicate lifecycle/priority in labels. Cross-repository coordination
lives in the consumer organization's explicitly chosen coordination repository; implementation
lives in the responsible repository. Handbook is not a universal issue destination. Search for
duplicates before proposing or creating work. Use sub-issues for independently owned
outcomes and checklists for small steps. Size is optional relative effort, not a deadline.

## Improving guidance

Use shared workflows by default. Before tailoring one, assess whether the improvement
applies to shared guidance and propose that change first. Record project-specific
overrides with rationale and authoritative local references. A shared proposal neither
authorizes external publication nor blocks independently authorized local work.
No universal local/shared winner replaces explicit conflict resolution. Team names,
project identities, capability limits and organization governance remain local facts.
