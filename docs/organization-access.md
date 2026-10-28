# Organization access

The default team model, permissions and procedures for a consumer's GitHub organization
on the Free plan. Follow [work policy](work-policy.md): inventory is read-only within an
assigned task; every access change needs explicit session authorization of an exact
change list. Who belongs to which team is always a human decision.

## Team model

Three teams receive access organization-wide through predefined organization roles, so
new repositories are covered automatically and no per-repository grants are needed.
Teams are named by slug; a team displayed as Admin has the slug `admin`.

| Team | Organization role | Repository access (organization role) | Organization projects | Purpose |
| --- | --- | --- | --- | --- |
| `admin` | Owner, for every member | Admin (`all_repo_admin`) | Admin | All features: settings, teams, members, billing, security, policy approval |
| `dev` | Member | Write (`all_repo_write`) | Write | Clone, push work branches, open and review PRs, manage issues and project fields |
| `support` | Member | Triage (`all_repo_triage`) | Write | Label, assign, close and reopen issues and edit project fields; no push |

- Only Owners manage organization settings, teams, invitations and billing, so the Owners
  and the `admin` team are the same people. The team makes review requests and mentions
  reach the whole group.
- Triage cannot push, but it can read code in private repositories; GitHub has no
  issue-only role.
- Project Write lets `dev` and `support` move Status and set Priority/Blocked. Project
  access never exposes issues in private repositories the person cannot read.
- **One drift rule:** no per-repository team grants and no direct collaborators. Anything
  else is a recorded exception (for example Maintain for one repository, or `support`
  excluded from a sensitive one) or drift.

## Organization settings

| Setting | Default | Where |
| --- | --- | --- |
| Base repository permission | No permission (access only through teams) | Settings → Member privileges |
| Two-factor authentication | Required | Settings → Authentication security |
| Team visibility | Visible (closed), never secret | Team settings |
| Forking private repositories | Disabled unless a repository needs it | Settings → Member privileges |
| Repository creation | Local choice; organization roles cover new repositories either way | Settings → Member privileges |
| Project base role | No access or Read, chosen locally | Project → Settings → Manage access |
| Outside collaborators | Recorded exceptions only | Settings → Outside collaborators |

## GitHub Free capabilities and limits

Free organizations offer teams, the five repository roles (Read, Triage, Write, Maintain,
Admin), base permissions, required 2FA, project team access and, as observed on
2026-10-28 despite inconsistent GitHub documentation, the predefined all-repository
organization roles. Custom repository and organization roles need Enterprise Cloud.
Private repositories on Free have no protected branches, rulesets, required reviewers or
code owners, so PR approval by `admin` and "no direct pushes to durable branches" are
procedures, not enforcement; public repositories get those protections. Never claim
GitHub enforces a rule it does not provide on the current plan. If an organization lacks
the all-repository roles, grant the same roles on each active repository instead.

## Recommendations and best practices

- Grant access through teams only, and keep `admin` to two or three people: Owners can
  delete repositories and remove members, and at least two Owners prevent lockout.
- New members join no team until an Admin places them. Prefer moving people between teams
  to stacking memberships (the highest grant wins, which hides over-grants); stacking is
  allowed when the human chooses it. A team's creator becomes its maintainer; leave that
  membership unless the human asks to remove it.
- No shared logins. Automation uses a GitHub App or a fine-grained token scoped to named
  repositories, never an Owner's personal token. Agents act through the acting human's
  own `gh` login; use an Owner session only for an authorized access change.
- Record every exception with reason, responsible person and review date.
- Enforcing 2FA removes members without it: list them first and warn them.
- Keep new repositories private; making one public is an `admin` decision. Enable
  Dependabot alerts everywhere and secret scanning where the plan offers it.
- Keep team names stable: renaming changes the slug, which breaks mentions and
  review-request references.

Lifecycle: **onboarding** — an Owner invites the person, adds them to one team and
confirms 2FA. **Role change** — move the person to the new team. **Offboarding** — on the
same day remove the person from the organization (not only from teams) and reassign their
open issues. **Quarterly review** — an Admin runs the check below for every organization,
resolves or records each gap and records the result. On private Free repositories, also
compare durable-branch commits with merged PRs to detect direct pushes.

## Check

The [access check](../scripts/org-access.mjs) inventories one or more organizations with
GET requests only and reports gaps against this model. It imports its sibling
`enroll.mjs`, so run it from a Handbook checkout or the task's resource snapshot (gh 2.48
or later for `--paginate --slurp`):

```text
node scripts/org-access.mjs --org ORG [--org ORG ...] [--full]
```

`--full` adds the raw inventory. An unreadable value is reported as `unknown`, never as
empty or disabled. Members without 2FA and the 2FA setting need an Owner credential;
organization roles need the `admin:org` token scope (a missing scope returns 404 and
reports `roles-unavailable`). Never upgrade scopes silently: the human runs
`gh auth refresh -h github.com -s admin:org`. Project team access is browser-only
(Project → ⋯ → Settings → Manage access) and is always listed as a limitation. A team's
repository list omits organization roles; check one person's effective access with
`gh api repos/ORG/REPO/collaborators/USER/permission --jq .role_name`.

Gap codes: `base-permission`, `two-factor`, `members-without-2fa`, `missing-team`,
`team-visibility`, `extra-team`, `owner-count`, `owner-not-in-admin`, `admin-not-owner`,
`roles-unavailable`, `missing-role`, `extra-role`, `repo-grant`, `missing-repo-grant`
(only without roles), `direct-collaborator`, `outside-collaborators`,
`pending-invitations`, `member-without-team` and `unknown`.

## Setup

1. Run the check. Turn each gap into an exact change with current and target values;
   list membership and Owner changes separately as human decisions. Existing teams that
   map onto the model may be renamed (grants and members are kept; the slug changes).
2. Obtain explicit authorization for that list. Flags and permission prompts do not
   establish authority. Changes outside the list need new authorization.
3. Apply in this order, so nobody loses access midway, then run the check again as
   readback. Report anything unverified as partial setup, never as complete.

```text
gh api -X PATCH orgs/ORG/teams/OLD_SLUG -f name=Admin            # or create:
gh api -X POST orgs/ORG/teams -f name=Support -f privacy=closed
gh api orgs/ORG/organization-roles --jq '.roles[] | select(.name|startswith("all_repo_")) | {id, name}'
gh api -X PUT orgs/ORG/organization-roles/teams/admin/ADMIN_ROLE_ID
gh api -X PUT orgs/ORG/organization-roles/teams/dev/WRITE_ROLE_ID
gh api -X PUT orgs/ORG/organization-roles/teams/support/TRIAGE_ROLE_ID
gh api -X DELETE orgs/ORG/teams/SLUG/repos/ORG/REPO              # each redundant per-repository grant
gh api -X PATCH orgs/ORG -f default_repository_permission=none
```

Without the roles, grant each active repository instead:
`gh api -X PUT orgs/ORG/teams/SLUG/repos/ORG/REPO -f permission=admin|push|triage`
(API names: `pull` Read, `triage`, `push` Write, `maintain`, `admin`). Add
`-F members_can_create_repositories=false` only for Owner-only repository creation.

Browser-only: require 2FA (Settings → Authentication security) once every member has it;
set project team access (`admin` Admin, `dev` Write, `support` Write); grant Owner and
team membership to the people the human named (Settings → People and the team page).

## Record and acceptance

An organization with a Handbook-adopted repository records its team slugs, project
access, exceptions, pending steps and readback in that repository's local operations
document, as Handbook does in [Uniwares operations](uniwares-project.md). Otherwise the
readback is recorded as an evidence entry in Handbook's [verification](verification.md)
until the organization adopts Handbook.

Setup is complete only when the readback check reports no gaps other than recorded,
accepted exceptions, and project team access is verified in the browser. Any other open
gap, including 2FA awaiting members, means partial setup: record it as pending with its
blocker and report it as partial, never as complete.

References: [repository roles](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization),
[organization roles](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization),
[organization roles REST API](https://docs.github.com/en/rest/orgs/organization-roles),
[teams REST API](https://docs.github.com/en/rest/teams/teams),
[GitHub plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans).
