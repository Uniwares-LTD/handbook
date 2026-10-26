# Initialize and use the handbook in another repository

This guide is for maintainers and agents onboarding a consumer repository. It covers
one-time initialization and everyday use. Only handbook is adopted at bootstrap;
other repositories retain their current rules until their own adoption PR is accepted.
Linking a repository to the project does not install guidance or migrate its queues.

Prerequisites: access to this private repository, Git, Node.js 22+, and an authorized
consumer adoption task. GitHub CLI with the appropriate repository/Projects access is
needed only for connected issue operations, not for reading the local documentation.

## Clone and refresh

From the directory containing your repository clones:

```powershell
git clone https://github.com/Uniwares-LTD/handbook.git handbook
node ./handbook/scripts/refresh-handbook.mjs --path ./handbook
```

If `handbook` already exists, inspect its origin, branch and worktree before using it;
do not clone over it or switch/reset it automatically. Keep the shared checkout on
clean `main`; use a separate checkout for handbook contributions. Save the helper's
reported `revision` in the adoption PR as the baseline used to reconcile guidance.

The default path is the current repository when it is handbook; otherwise its sibling
`../handbook`. `--path` or `UNIWARES_HANDBOOK_PATH` overrides discovery. Run the script
from the consumer root when relying on the sibling default. Relative overrides are
resolved against the current directory. No global installation or symlinks are needed.

Refresh checks the origin identity, requires a clean main checkout, fetches main and
fast-forwards only. It records the synchronized commit in Git's private metadata.
It never resets, stashes, switches branches, pushes or discards work. It refuses an
unexpected origin, including a first-use wrong repository.

When dirty, diverged, ahead of origin, on another branch or offline, refresh returns
the last successful baseline and a limitation. Read policy/skills from that exact
commit with `git -C <resolved-path> show <revision>:docs/work-policy.md` (substitute
the helper's returned path/revision). Do not read dirty working files as the fallback.
Relative references in a fallback skill resolve in the same commit via git show.
If no valid synchronized baseline exists, stop policy-dependent work and obtain it;
never manufacture a baseline from an unverified local branch. Changes to the helper
itself require review before executing a locally modified copy.

## Consumer adoption (deferred)

Only handbook is adopted initially. For each future consumer, use a separately
authorized PR to:

1. Inventory AGENTS.md, adapters, existing skills and their provenance. Resolve local
   conflicts explicitly, especially issue authority, closure, and publication rules.
2. Add a handbook path/bootstrap reference to AGENTS.md and retain repository-specific
   architecture, test commands, operational ownership and canonical documentation.
3. Add thin `.agents/skills/<name>/SKILL.md` entrypoints with matching name/description.
   Each instructs the agent to refresh the handbook, then read the corresponding
   `.agents/skills/<name>/SKILL.md` at the returned revision. Preserve existing resource
   licenses/provenance when replacing local copies; update local integrity checks.
4. Adapt the local repository adapter and issue/PR templates. Copy forms from handbook
   deliberately; they do not automatically propagate from this private repository.
5. Validate local discovery, offline baseline reads, links, checks, and authorization
   scenarios. Record the adopted handbook revision and approve the migration.

Do not migrate existing pending doc queues unless separately authorized. Until that
migration occurs, retain their authority and link them explicitly as legacy queues.
No global framework, application, provider or infrastructure policy is extracted here.

### AGENTS.md integration

Add a section like the following to the consumer's root AGENTS.md after reconciling
existing rules. The relative link assumes sibling checkouts; agents using an override
must resolve the files from that path instead. Do not replace domain-specific guidance.

```markdown
## Shared Uniwares guidance

This repository adopts the Uniwares handbook work policy. At task start follow
the initialization and refresh procedure in ../handbook/docs/onboarding.md.
Resolve the handbook from UNIWARES_HANDBOOK_PATH when set, otherwise ../handbook.
Run its scripts/refresh-handbook.mjs with --path pointing to that checkout.
Use the returned path and revision to read docs/work-policy.md and docs/project.md,
then this repository's .agents/repository-adapter.md and relevant local instructions.
Read only the shared skills and supporting resources needed for the task.
On fallback, use git show at the returned revision, including relative resources;
report the revision and limitation. If no synchronized baseline exists, stop
policy-dependent work. Do not reset, stash, discard edits or switch branches to refresh.
Explicit session instructions remain controlling. Resolve conflicting local rules;
do not silently weaken authority or infer publication permission from a skill.
```

The consumer adapter should identify its canonical architecture/setup/evidence docs,
test and build commands, operational ownership, publication permissions, and any
explicitly retained legacy queues. Record the initial handbook revision and the
decisions resolving old rules in the adoption PR or a local decision record. This
revision records adoption evidence; daily refresh follows approved handbook `main`.
Handbook refresh must not silently edit the consumer adapter or migrate its backlog.

### Thin local skill entrypoints

Create a local `.agents/skills/NAME/SKILL.md` only for each shared skill being adopted.
Use the corresponding handbook skill's current `name` and `description` frontmatter;
keep the entrypoint thin instead of copying its procedure. For example, the local
`work-on-task/SKILL.md` can contain:

```markdown
---
name: work-on-task
description: Implement and verify bounded repository work, then perform a separate read-only review and evidence handoff.
---

Follow this repository's AGENTS.md handbook resolution and refresh procedure.
Read .agents/skills/work-on-task/SKILL.md from the returned handbook path/revision.
Resolve that skill's relative policy, role and resource references inside the same
handbook revision, not relative to this local wrapper. Read this consumer's adapter
for local contracts and commands. On fallback, use immutable git show reads and
report the limitation; stop if there is no synchronized baseline.
```

Do not copy handbook's own AGENTS.md or repository adapter into consumers. Do not
install shared skills globally or create symlinks. Preserve original attribution,
licenses and local adaptations when replacing existing skill copies; update the
consumer's own provenance and integrity records deliberately.

| Shared skill | When to use it |
| --- | --- |
| compile-feature-spec | Resolve scope and observable acceptance before engineering |
| work-on-task | Implement and verify an authorized bounded task |
| review-change | Perform a separate read-only review of the final diff |
| sync-docs-issues | Reconcile canonical documentation and authorized issue evidence |
| capture-project-learnings | Retain useful verified knowledge in its owning docs |
| manage-issues | Triage/enroll/maintain issues within member and agent authority |

### Adoption acceptance

Before accepting the consumer PR, verify that a new checkout can locate the handbook,
refresh it, read the returned revision and resolve one thin skill plus its supporting
resources. Verify a safe fallback using the helper fixture tests; do not deliberately
dirty or disconnect another person's shared checkout. Review conflicting authority
rules, queue ownership, forms, provenance and local checks. Record which skills were
adopted and any deferred migration. No live test issue is necessary.

## Everyday task-start workflow

From an adopted consumer repository root, this PowerShell sequence supports the
default sibling clone and an explicit local override. It captures the exact baseline
and reads policy from Git even when the worktree is dirty or cannot refresh:

```powershell
$handbookPath = if ($env:UNIWARES_HANDBOOK_PATH) {
    $env:UNIWARES_HANDBOOK_PATH
} else {
    Join-Path (Get-Location) '../handbook'
}
$handbookResult = & node (Join-Path $handbookPath 'scripts/refresh-handbook.mjs') --path $handbookPath
if ($LASTEXITCODE -ne 0) { throw 'No usable handbook baseline; resolve guidance before continuing.' }
$handbookState = $handbookResult | ConvertFrom-Json
$handbookState | Format-List path, revision, fresh, limitation
git -C $handbookState.path show "$($handbookState.revision):docs/work-policy.md"
git -C $handbookState.path show "$($handbookState.revision):docs/project.md"
```

On other shells, resolve the same path and run `node PATH/scripts/refresh-handbook.mjs
--path PATH`; use the returned path/revision for `git show` as above. The override is
local configuration: do not commit a developer's absolute path. If the helper itself
has local changes, inspect/review them before executing it; do not trust modified
bootstrap code merely because an older synchronized policy exists.

Next read the consumer adapter, applicable scoped instructions and the authorized task.
Use the relevant shared skill at the same revision; for example, in PowerShell:

```powershell
git -C $handbookState.path show "$($handbookState.revision):.agents/skills/work-on-task/SKILL.md"
git -C $handbookState.path show "$($handbookState.revision):.agents/agents/implementation.md"
```

Resolve all relative references in that same revision. If `fresh` is false, report its
limitation and use the returned baseline; do not substitute dirty working files. If
there is no baseline or a policy conflict prevents deciding authority, stop the affected
work and resolve it with the maintainer. Never treat a refresh failure as permission
to bypass policy. Record the handbook revision in the task handoff.

## Where to read and write documentation

| Need | Canonical source or destination |
| --- | --- |
| Authority, readiness, issue ownership and acceptance | [Work policy](work-policy.md) |
| Project fields, views, access and enrollment commands | [Project operations](project.md) and [project configuration](../project.json) |
| Issue examples and verification handoffs | [Examples](examples.md) |
| Shared skill source, supporting contracts and provenance | `.agents/skills`, `.agents/agents`, and [provenance](../PROVENANCE.md) in handbook |
| Application architecture, setup, operations and verified implementation evidence | Consumer documents named in its repository adapter |
| Pending implementation/documentation work after adoption | Issues in the owning repository; handbook issues for cross-repository coordination |

Link to shared policy instead of maintaining competing copies in consumer docs.
Keep application-specific decisions and commands in the consumer. Follow the shared
evidence format when handing off work; report implementation, checks, review and any
publication/deployment/live acceptance separately. Agents may not create new issues,
change priority/ownership or close work merely because a guide suggests a next step.

For approved issue enrollment, follow project operations. A missing Projects scope
requires ordinary user authentication/access resolution; do not add a service token
or silently change credentials. Consumer adoption and project linking/enrollment are
separate actions and must each be within the authorized task.

## Contribution and refresh trust

Devs propose handbook policy changes by PR; an Admin approves before merge. This is a
procedural requirement, not a protected-branch guarantee on the current plan. Clean
remote main is the synchronized shared baseline. Refresh does not prove that a human
review occurred; maintainers are responsible for the approval procedure.
