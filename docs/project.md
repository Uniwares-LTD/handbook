# Project operations

These procedures apply to the consumer's GitHub organization. Handbook's own
[Uniwares operations](uniwares-project.md) and project.json are local facts, never
default destinations for other repositories. Follow [work policy](work-policy.md).

## Inventory and destination choice

Use maintain-project. Resolve the target from repository configuration, Git remotes
and GitHub repository identity. Ambiguous remotes require an explicit OWNER/REPO;
never use the authenticated account or silently follow a fork's upstream.
Inventory accessible organization projects, linked repositories, fields/options,
views/workflows, permissions, open issues and accepted local queues. Paginate results.
An access error is not an empty inventory; hidden projects cannot be ruled out even
after complete pagination. Personal-account projects and other trackers are recognized
but not migrated by these tools. Preserve their existing workflows.

During first project and workflow setup, also ask which language issues and comments
should use: English (the default) or Persian. Record the answer as the issue language in
the [repository preferences](project-guidance.md#repository-preferences); labels, issue
types, fields, options and status names stay in English either way.

Every adopted repository records one tracking project. On first setup present the
actual candidates and ask the user to choose: reuse an existing project, an
organization-wide project, or a dedicated repository project. The default is the
organization-wide project; use an existing one when the organization already has it,
otherwise propose creating it. A dedicated repository project is the exception, chosen
when the repository's work must stay separate. No automatic choice by title, and no
enrollment of a repository merely because a project is shared. Later maintenance reuses
the recorded selection unless invalid or explicitly changed. Adoption, repository links,
issue enrollment and access changes remain separate decisions.

## Consumer configuration

Add a `tracking` repository-relative JSON path to handbook.json. Adoption is incomplete
until it is recorded; readiness reports it as a warning and tracking operations refuse
to run without it. Keep this file with the consumer, never in Handbook's catalog of
other projects.

```json
{
  "version": 1,
  "provider": "github",
  "organization": "example-org",
  "title": "Delivery",
  "scope": "repository",
  "number": 12,
  "url": "https://github.com/orgs/example-org/projects/12",
  "repositories": ["example-org/product"],
  "policy": ".agents/repository-adapter.md",
  "fieldNames": {"status": "Status", "priority": "Priority", "blocked": "Blocked"}
}
```

For approved creation omit number/url and set scope repository or organization.
An optional id confirms the selected project; never use mutable title as its identity.
Optional statuses map all six lifecycle names to distinct local option names.
Optional managedViews names existing views whose exact proposed replacement has
been reviewed. Unlisted customized views are preserved and conflicts reported.
Old organization/number/url/repositories configurations remain supported.
Field mappings use names resolved to live IDs; old settings-URL suffixes are historical,
not GraphQL IDs. Policies and accepted exceptions stay in the referenced local document.

## Default workflow and views

Use Backlog, Ready, In progress, In review, Done and Cancelled. Done means accepted
completion; Cancelled means closed without completion, including not-planned/duplicate
work. Keep native closure reasons and duplicate references. Deployment/live acceptance
stay in acceptance checklists; retain In review until the agreed outcome is accepted.
Ready requires bounded scope, acceptance, priority and one accountable human; other
contributors may be assigned without competing accountability.

Priority: P0 urgent interruption, P1 next, P2 normal, P3 deferred. Blocked is independent
of lifecycle; record reason, responsible person and next action in the issue. An empty
blocker field is untriaged, not implicitly Not blocked. Size and dates remain optional.
Map native Task/Bug/Feature and dependency support where available; propose local
equivalents when absent instead of claiming unsupported features are configured.

Active work is the default open-issue board grouped by status. Triage shows backlog
and unclassified work; inventory/readiness review also exposes missing owner, priority,
blocker decisions, scope or acceptance that filters cannot fully represent. My items,
Blocked and Review support daily work. History shows closed issues and closure reason.
By repository is useful for organization-wide projects. Roadmap/Priority views are optional.
Preserve existing custom views rather than deleting them to enforce this default.

## Preview and apply

Run the helpers from the consumer cwd, using the task's committed Handbook resource
snapshot. Keep the five sibling tracking scripts together; no npm dependencies are needed.
The shared launcher source remains the trusted Uniwares Handbook, independent of the
consumer's project owner. Replace SCRIPT with the appropriate snapshot script path.

```text
node SCRIPT/project-management.mjs inventory --repo example-org/product
node SCRIPT/project-management.mjs preview --config project.json --repo example-org/product
node SCRIPT/project-management.mjs apply --plan reviewed-preview.json
node SCRIPT/create-issue.mjs --config project.json --spec approved-issue.json
node SCRIPT/create-issue.mjs --config project.json --spec approved-issue.json --apply --expect FINGERPRINT
node SCRIPT/enroll.mjs --config project.json
node SCRIPT/enroll.mjs --config project.json --apply example-org/product#123
```

Save preview JSON to a local ignored file for review. Obtain authorization for its exact
destination/operations before apply; flags do not establish authority. Apply revalidates
the preview, preserves option IDs and custom content, and reads back changes. A stale
preview or uncertain write stops the operation with partial results. Inventory again,
select any newly created project by number, and review a fresh preview; never replay
creation blindly. Existing items, permissions and visibility are not migration targets.
New projects must remain private. No token scope upgrades or scheduled automation.

API support varies. Workflow editing, grouping and default-view selection require
explicit browser/manual verification. Disable unconditional closed-to-Done and independent
acceptance automation; preserve approved added/reopened-to-Backlog behavior. Do not use
GitHub's auto-add workflow: agents add issues explicitly through `create-issue.mjs` and
`enroll.mjs`, which works the same for every repository and plan. An API success with
manual steps outstanding is partial setup, not completion.
See [GitHub's API](https://docs.github.com/en/graphql/reference/projects) and
[filter documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects).

### Configure workflows in the browser

The API can read workflow state and delete workflows, but cannot create or enable them.
A human with project admin access performs these steps:

1. Open the project, then **⋯** → **Workflows**.
2. Confirm **Item added to project** and **Item reopened** are on and set Status to Backlog.
3. Confirm **Auto-add to project**, **Item closed**, **Auto-close issue**, **Auto-add
   sub-issues to project**, **Pull request linked to issue** and **Pull request merged** are off.

Then add pre-existing open issues with the enrollment helper and set Blocked explicitly.
Agents report these as outstanding manual steps; they never claim them from API output.

### Setup acceptance

Project setup is complete only when all of these are verified and recorded in the
consumer's verification evidence:

- The tracking file is recorded in handbook.json and readiness reports no tracking warning.
- The repository preferences record the issue language the user chose (English if no
  preference) and the confirmed durable branches, the integration branch is the
  repository's default branch, and readiness reports no preferences warning.
- Workflow readback (`workflows { name enabled }` on the project) shows item added and
  item reopened enabled, and every workflow in step 3 disabled.
- The enrollment helper reports no missing open issues for the selected repositories.
- Agent guidance routes approved issue creation through `create-issue.mjs`. The first real
  issue it creates after setup is in Backlog with Blocked set; until then, record setup as
  pending this check and never create a demonstration issue.
- Views, grouping and default view match the defaults above or accepted local exceptions.

## Issue maintenance and acceptance

Agents create approved issues only through `create-issue.mjs`, never bare `gh issue
create`. Write the agreed destination, title, body, type, labels and Blocked value to a
local ignored JSON spec. The default run is a read-only preview: it checks the repository
against the tracking selection, labels, type and project fields, and lists likely
duplicates: every title-word search match plus exact-title matches among recent issues,
which catches an issue search has not indexed yet. Show that preview to the human. Mark candidates the human confirms are not
duplicates in `reviewedDuplicates` and preview again. After approval of that exact
preview, run `--apply --expect FINGERPRINT`. Apply refuses if the spec, project or
duplicates changed, creates the issue once, adds it to the recorded project (reusing an
existing item), fills an empty Status with Backlog, sets Blocked and reads
both back. If tracking fails after creation, it reports the created issue and what was
completed; rerun with the same options plus `--resume NUMBER`, which finishes tracking
without creating. If the create request's outcome is unknown, do not rerun `--apply`:
preview again, and resume the exact-title match it reports. Priority, assignees and
sub-issue links remain human decisions.

```json
{ "repository": "example-org/product", "title": "Short outcome", "body": "Problem, scope, acceptance",
  "type": "Task", "labels": ["documentation"], "blocked": "Not blocked", "reviewedDuplicates": [] }
```

Issues created outside the helper (in the GitHub UI or before setup) are added with the
enrollment helper. It reports missing open issues without writing; apply only explicit
authorized references, then set Blocked. No bulk backlog migration,
PR cards or invented issues. Preserve issue scope, assignees and priority unless the
user authorizes those decisions.

Humans accept/cancel and close issues. Agents may mirror that verified decision into
Done/Cancelled, never infer it from a PR merge or the identity of the credential.
Use `reconcile-status.mjs --issue OWNER/REPO#N` for a report. For authorized mirroring,
provide `--evidence FILE --apply`; the JSON maps each reference to eventId, actor and
decisionReference (the actual human instruction/acceptance evidence). Re-fetch the latest
closure, confirm a human actor, closure reason and current closed state. Bots, commit-linked
closures, missing evidence, reopened issues and unknown reasons remain unchanged.
Only project status is written, never issue closure, acceptance, cancellation or comments.
Re-read after writes; reconcile partial outcomes before retrying.
