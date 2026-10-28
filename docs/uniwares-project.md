# Uniwares local project operations

Project: **Uniwares**, private, organization-wide. See [project.json](../project.json)
for the actual URL, IDs, fields and enrolled repositories. Existing project #1 is excluded.

## Access

Uniwares-LTD follows the shared [organization access](organization-access.md) model,
applied and read back on 2026-10-28; see [open checks](#open-checks):

| Resource | Organization members | `admin` | `dev` | `support` |
| --- | --- | --- | --- | --- |
| All repositories (organization roles) | No permission | Admin (all_repo_admin) | Write (all_repo_write) | Triage (all_repo_triage) |
| Uniwares project #2 | Read | Admin | Write | Write |

Owners Amir-Ahani, sinasava and uniwares-uk form `admin`. Local choices: members may
create repositories; `dev` keeps sinasava and uniwares-uk; `support` keeps its creator.
No per-repository team grants or direct collaborators exist.
Project #2 team access was confirmed in the browser on 2026-10-28; a redundant individual
Admin entry for uniwares-uk remains. Pending: 2FA requirement after ParhamBeik enables
2FA. Project #1 is unchanged.

Project access does not expose private repository issues to people lacking repository
access. Organization owners retain administrative capabilities. Admin approval for
handbook policy is procedural on the private Free plan. Do not claim field-level or
closure restrictions are enforced by GitHub; members/agents follow the policy.

## Fields and views

Status: Backlog, Ready, In progress, In review, Done, Cancelled. Priority: P0 urgent interruption,
P1 next priority, P2 normal, P3 deferred. Leave priority unset until triage; require it
before Ready. Blocked: Not blocked / Blocked. Size: optional XS/S/M/L/XL. Start date and
Target date are optional. Use native Repository, Assignees, Type, Labels and sub-issue
progress. No estimates, iterations, or fixed work-in-progress limits.

Active work is the default open-issue board grouped by Status. Triage is a table
of open issues outside Ready/In progress/In review; readiness review also checks
missing priority, accountability, blocker decisions, scope and acceptance. Review
shows open In review issues. History shows closed issues with native closure reasons
and the Closed date. My items filters open issues assigned to @me; Blocked filters
open blocked issues. By repository groups open issues by Repository. The optional
Priority board and Roadmap (Start date/Target date) remain available. Undated work
remains visible in Active work.

## Automation and enrollment

Target configuration: two workflows enabled, item added to Backlog and item reopened to
Backlog. Auto-add to project, the unconditional item closed to Done workflow, and all
auto-close, auto-add sub-issues, archive, merge and review-driven workflows disabled.
Auto-add to project is still enabled live until a human turns it off; see open checks. Closure is a human
decision under policy. Agents may mirror verified human completion to Done or
not-planned closure to Cancelled, preserving reasons and duplicate links.

Agent-created issues in adopted repositories reach the project through
`create-issue.mjs`; issues people create in the GitHub UI are added with the enrollment
helper. The first issue created this way, Uniwares-LTD/handbook#8 on 2026-10-28, landed
in Backlog with Blocked set, which satisfies the first-real-issue setup check.

Handbook is the default repository when creating an issue from the project. Select
the owning repository for application work. Project drafts are not the work queue;
create approved repository issues instead. Agents create them with `create-issue.mjs`,
which also adds them to this project; enroll human-created issues through an agent acting
on that assigned work or by hand. Set Blocked during enrollment/triage.
Do not add PR cards; reference PRs from issue evidence without auto-closing links.

From handbook, `node scripts/enroll.mjs` reports open issues missing from the project.
`node scripts/enroll.mjs --apply Uniwares-LTD/handbook#123` adds exactly that existing
issue if missing. Replace 123 with the approved real issue number. Multiple `--apply`
arguments are supported. The tool never creates issues or changes assignment/priority.
Inspect readback after a failed write before retrying. Errors return a nonzero result;
partial successful additions are reported and reruns skip enrolled issues.

Use a locally authenticated gh account with repository read and Projects read access;
applying additions needs Projects write access. A missing scope is reported, never
silently upgraded. No tokens belong in repository configuration. There is no unattended
enrollment: no auto-add, scheduled or token-based automation.

For a new repository: approve onboarding, link it to the project, add its full name to
project.json, then reconcile approved issues. Linking alone neither imports issues
nor adopts handbook policy. Initial setup imports no backlog and creates no issues.

## Generic-guidance migration

This file records Handbook's local configuration, not a consumer destination.
The migration applied on 2026-10-27 added Cancelled, disabled unconditional closed-to-Done and
configured Active work, Triage, My items, Blocked, Review and History, with By repository
for this organization-wide project. Existing optional Priority/Roadmap views may remain.
Migration evidence is in Git history (`docs/verification.md`, removed after #8). Preserve project #1 and access.

## Open checks

- A human turns off the live Auto-add to project workflow (browser only).
- The 2FA requirement is not yet enforced in Uniwares-LTD or karpishe-org. The read-only
  access check lists members without 2FA; enforcing it removes them, so a human decides.
- Claude Code runtime acceptance remains pending; see [client acceptance](clients.md).
