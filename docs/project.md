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

On first setup present the actual candidates and ask the user to choose reuse,
a dedicated repository project, or an organization-wide project. No automatic choice
by title, no organization-wide enrollment merely because a project is shared.
Later maintenance reuses the recorded selection unless invalid or explicitly changed.
Adoption, repository links, issue enrollment and access changes are separate decisions.

## Consumer configuration

Add an optional `tracking` repository-relative JSON path to handbook.json. Existing
integrations without it remain usable; tracking operations require selection first.
Keep this file with the consumer, never in Handbook's catalog of other projects.

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
snapshot. Keep the four sibling tracking scripts together; no npm dependencies are needed.
The shared launcher source remains the trusted Uniwares Handbook, independent of the
consumer's project owner. Replace SCRIPT with the appropriate snapshot script path.

```text
node SCRIPT/project-management.mjs inventory --repo example-org/product
node SCRIPT/project-management.mjs preview --config project.json --repo example-org/product
node SCRIPT/project-management.mjs apply --plan reviewed-preview.json
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
acceptance automation; preserve approved added/reopened-to-Backlog behavior. An API
success with manual steps outstanding is partial setup, not completion.
See [GitHub's API](https://docs.github.com/en/graphql/reference/projects) and
[filter documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects).

## Issue maintenance and acceptance

Enrollment reports missing open issues without writing. Apply only explicit authorized
references; no bulk backlog migration, PR cards or invented issues. Preserve issue scope,
assignees and priority unless the user authorizes those decisions.

Humans accept/cancel and close issues. Agents may mirror that verified decision into
Done/Cancelled, never infer it from a PR merge or the identity of the credential.
Use `reconcile-status.mjs --issue OWNER/REPO#N` for a report. For authorized mirroring,
provide `--evidence FILE --apply`; the JSON maps each reference to eventId, actor and
decisionReference (the actual human instruction/acceptance evidence). Re-fetch the latest
closure, confirm a human actor, closure reason and current closed state. Bots, commit-linked
closures, missing evidence, reopened issues and unknown reasons remain unchanged.
Only project status is written, never issue closure, acceptance, cancellation or comments.
Re-read after writes; reconcile partial outcomes before retrying.
