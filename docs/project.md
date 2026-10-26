# Project operations

Project: **Uniwares**, private, organization-wide. See [project.json](../project.json)
for the actual URL, IDs, fields and enrolled repositories. Existing project #1 is excluded.

## Access

| Resource | Organization members | Admins | Devs |
| --- | --- | --- | --- |
| Uniwares project | Read | Admin | Write |
| handbook repository | Read | Admin | Write |
| Existing repositories | Unchanged | Unchanged | Unchanged |

Project access does not expose private repository issues to people lacking repository
access. Organization owners retain administrative capabilities. Admin approval for
handbook policy is procedural on the private Free plan. Do not claim field-level or
closure restrictions are enforced by GitHub; members/agents follow the policy.

## Fields and views

Status: Backlog, Ready, In progress, In review, Done. Priority: P0 urgent interruption,
P1 next priority, P2 normal, P3 deferred. Leave priority unset until triage; require it
before Ready. Blocked: Not blocked / Blocked. Size: optional XS/S/M/L/XL. Start date and
Target date are optional. Use native Repository, Assignees, Type, Labels and sub-issue
progress. No estimates, iterations, or fixed work-in-progress limits.

Overview is the default table, includes closed items and shows issue-state reasons.
Status board groups open issues by Status; Priority board groups them by Priority.
My items filters open issues assigned to @me. Blocked filters open blocked issues.
Roadmap uses Start date and Target date for open issues. By repository groups an open
issue table by Repository. Undated work remains visible in Overview.

## Automation and enrollment

Only three workflows are enabled: item added → Backlog; item closed → Done; item
reopened → Backlog. All auto-close, auto-add (including sub-issues), archive, merge and
review-driven workflows are disabled. Closure is a human decision under policy.

Handbook is the default repository when creating an issue from the project. Select
the owning repository for application work. Project drafts are not the work queue;
create approved repository issues instead. Enroll all new approved issues manually
or through an agent acting on that assigned work. Set Blocked during enrollment/triage.
Do not add PR cards; reference PRs from issue evidence without auto-closing links.

From handbook, `node scripts/enroll.mjs` reports open issues missing from the project.
`node scripts/enroll.mjs --apply Uniwares-LTD/handbook#123` adds exactly that existing
issue if missing. Replace 123 with the approved real issue number. Multiple `--apply`
arguments are supported. The tool never creates issues or changes assignment/priority.
Inspect readback after a failed write before retrying. Errors return a nonzero result;
partial successful additions are reported and reruns skip enrolled issues.

Use a locally authenticated gh account with repository read and Projects read access;
applying additions needs Projects write access. A missing scope is reported, never
silently upgraded. No tokens belong in repository configuration. GitHub Free permits
one native auto-add workflow; this setup intentionally uses no unattended enrollment.

For a new repository: approve onboarding, link it to the project, add its full name to
project.json, then reconcile approved issues. Linking alone neither imports issues
nor adopts handbook policy. Initial setup imports no backlog and creates no issues.
