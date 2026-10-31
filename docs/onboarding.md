# Initialize and update Handbook integration

Start at [README](../README.md). Consumers follow main without version pins or routine
upgrade PRs. Infrastructure and unitale-mockup remain unadopted. Project linking does
not adopt policy, migrate queues or change permissions.

## First adoption and repeat updates

1. Inspect AGENTS.md, CLAUDE.md, scoped instructions, skills, adapter and canonical
   documents. Confirm authorized local adoption/update scope. Preserve adaptations and
   legacy queues; identify actual conflicts rather than replacing local instructions.
2. Establish [project guidance and a local source map](project-guidance.md). Reuse
   canonical documents and select relevant technology skills. Record the tracking
   project per [project operations](project.md): existing, organization-wide (default)
   or dedicated. Creating or linking a project is separately authorized. Ask the issue
   language (English by default, or Persian) and confirm the durable branches (integration
   `main` or `dev`, optional `_<environment>` deployment branches), then record both in the
   [repository preferences](project-guidance.md#repository-preferences). Use maintain-docs to start
   any of these documents from the [starter templates](templates.md).
3. Copy [the launcher](../scripts/handbook.mjs) and [offline tool](../scripts/handbook-integration.mjs)
   to the consumer's scripts directory. Reconcile existing copies through reviewed edits.
   Add commands below. No dependency installation or global installation is required.
4. Create metadata and reconcile the instruction snippet below with existing AGENTS.md.
   Do not copy Handbook's own AGENTS.md or adapter over the project's instructions.
5. Run setup, retain path/revision, and materialize resources at that revision. Pass the
   returned resourcePath to explicit sync. Inspect changes and conflicts; reconcile
   unmanaged/modified wrappers manually, retaining their adaptations in local guidance.
   Offer the issue, PR and docs [starter templates](templates.md) through maintain-docs.
6. Run offline readiness and drift checks. Read shared policy/relevant domains at the
   task revision plus local sources. Report changes, checks, unknowns and limitations.
7. Optionally, with separate authorization, inventory and set up the organization's
   teams and permissions per [organization access](organization-access.md).

Example `handbook.json` (use actual canonical document references):

```json
{
  "version": 1,
  "kind": "consumer",
  "guidance": ".agents/repository-adapter.md",
  "sourceMap": "docs/architecture.md#source-map",
  "preferences": ".agents/repository.md",
  "technologySkills": ["grilling", "diagnosing-bugs", "ponytail", "asd-ste100", "next-best-practices", "playwright"]
}
```

`technologySkills` selects every non-core skill. The practice skills grilling,
diagnosing-bugs, ponytail and asd-ste100 suit most projects; add stack skills only on
stack evidence. Each selected skill adds its description to agent context, so select
only what the project uses.

Add these package commands:

```json
{
  "handbook:setup": "node scripts/handbook.mjs setup",
  "handbook:check": "node scripts/handbook.mjs check",
  "handbook:doctor": "node scripts/handbook.mjs doctor",
  "handbook:ready": "node scripts/handbook-integration.mjs check",
  "handbook:sync": "node scripts/handbook-integration.mjs sync",
  "handbook:entrypoints": "node scripts/handbook-integration.mjs check-entrypoints",
  "handbook:templates": "node scripts/handbook-integration.mjs templates"
}
```

AGENTS.md snippet (adjust local references):

```markdown
Follow the shared GitHub access policy (docs/work-policy.md#github-access).
Run Git/MCP/gh and helpers that invoke them outside the sandbox from the first attempt.

At task start run npm run handbook:check outside the sandbox; cached guidance is fine. For multi-session
or handed-off work keep its path and revision as docs/bootstrap.md describes. Local
guidance: .agents/repository-adapter.md and docs/architecture.md#source-map. Read the
shared work policy when an action depends on authority, lifecycle or branches. Skills
are selected in handbook.json. Without a baseline, continue under local rules and
pause only dependent decisions. Start issues, PRs and documents from the permissive
templates in .github and docs/templates, else the shared starters (docs/templates.md);
set up or refresh them with maintain-docs. After skill or
routing changes run handbook:sync and handbook:entrypoints; preserve custom instructions.
```

Run the following with PATH/SHA/SNAPSHOT from setup/resources (not values to commit).
Use `npm.cmd` on Windows if PowerShell wrappers are blocked.

```text
npm run handbook:setup
node scripts/handbook.mjs resources --path PATH --revision SHA
npm run handbook:sync -- --source SNAPSHOT
npm run handbook:ready
npm run handbook:entrypoints -- --source SNAPSHOT
```

Repeat for explicit integration upgrades without duplicate documentation. Re-copy the
offline tool first: its core skill list decides which skills sync adds, such as maintain-docs. Without
`--source`, sync updates Claude references from local Codex entrypoints. A committed
snapshot source also updates consumer Codex references/metadata. It updates intact
managed content and preserves appended custom content. Modified managed or unmanaged
files require manual reconciliation; orphans are reported, never deleted. Check after sync.

## Starter templates

Permissive issue, PR and docs starters are described in [templates](templates.md). Use
maintain-docs to copy them once; the repository owns every copy, and later updates are
opt-in per file.

## Refresh, provenance and result contract

Setup clones the expected private origin only if absent. Existing paths must be ordinary
checkouts with that origin. `--path PATH` and `UNIWARES_HANDBOOK_PATH` are local overrides.
The launcher executes the committed baseline helper, or clean committed main on first
setup, never a dirty working copy. Pre-contract helpers with refresh/diagnose exports
remain supported; older unrecognized helpers require explicit bootstrap reconciliation.
Without a baseline, main must be an ancestor of the existing origin/main reference;
ahead/diverged or uninitialized tracking state is rejected before shared code executes.
Keep the shared helper self-contained for data-URL loading; relative runtime imports
require a protocol/launcher change.

Checks refresh lazily after four hours, with the same failed-attempt cooldown. `check
--force` retries immediately without replacing an active task's revision. The interval
governs attempts, not maximum baseline age. Preserve dirty, diverged, ahead-of-main and
non-main checkouts; never reset, stash or switch branches. Cached operation validates
origin and accepted commit; doctor remains read-only. Invalid consumer metadata is
reported as a warning without suppressing baseline diagnostics.

Existing result fields `path`, `revision`, `fresh`, `mode`, `synchronizedAt`, optional
`limitation` and `read` remain. Add `usable`, `status`, `lastAttempt`, `outcome` and
`reason`. Last attempt records `attemptedAt` and optional limitation separately from
successful synchronization. No usable baseline produces an actionable command failure,
not a fabricated revision. Consumer readiness remains a separate warning-only result.

Before promotion, validate required guidance, helper syntax/exports, indexed resources, skill identities and
`handbook-contract.json` when present. Incompatibility retains the previous baseline and
checkout. Deployed legacy helpers cannot retroactively run new checks: the initial
transition must be reviewed and API-compatible; later refreshes use the new validation.
Export validation parses and links the module without evaluating candidate code; it
checks real named exports, including aliases, rather than strings in the source.

An exclusive lock and bounded Git calls protect refreshes; cached guidance remains usable
during another refresh. Without a baseline retry after initialization. After interruption,
inspect lock PID before manually removing a stale lock. Never remove a running lock.

Text uses git show. The optional resources command creates a revision-keyed snapshot
under Git metadata, preserving dependencies. It compares cached files with committed
blobs and rejects modified snapshots. Interrupted temporary directories remain private
cache for inspected manual cleanup. No task registry, scheduled updater or symlink is used.

## Offline, clients and migration

Offline readiness requires only Node and consumer files: no private clone, credentials,
Git or network. Warnings do not fail CI; missing facts may prevent dependent decisions.
Adoption never requires a CI workflow: the handbook's own validation workflow is not
copied or synced, and a project adds readiness checks to its CI only if it chooses to.
Offline derived-project creation copies only permitted bootstrap/entrypoints and reviewed
local guidance. It neither clones private Handbook content nor enrolls projects. Never
include credentials, private caches or machine paths in generated projects.

Codex uses `.agents/skills`; Claude gets thin `.claude/skills` references and CLAUDE.md
importing `@AGENTS.md`. Canonical procedures stay in `.agents/skills`. Reading Markdown
does not register hooks, subagents, permissions or dependencies. Preserve legitimate
client-specific content; see [client acceptance](clients.md).

Command gates live in [`.agents/gated-commands.json`](../.agents/gated-commands.json): commands
a client must confirm with the user and files it must not read. Gate only irreversible or
outward-facing actions; a prompt on routine authorized work is friction, not safety. Sync
with `--source` merges the shared list into the consumer's copy add-only, so project
entries stay, except commands the shared list marks `retired`, which sync removes. Sync
then adds the matching `Bash(...)`/`PowerShell(...)` ask rules and `Read(...)` deny rules
to `.claude/settings.json`, removes the exact rules generated for retired commands, and
keeps every other setting; `handbook:entrypoints` reports missing or retired entries.
Roles in `.agents/agents` with frontmatter also become managed, read-only
`.claude/agents` subagents. Codex rules are configured by hand until their format is verified.
Gates are a backstop, not authority, and prefix rules can be bypassed (see
[work policy](work-policy.md#agent-authority)).

Implement, test and separately review Handbook first, then obtain authorized publication,
review and merge into main. Only afterwards update Unibase's launcher, metadata, local
source map and wrappers. Preserve architecture, accepted milestones, adaptations,
provenance and advisory checks. Remove duplicated skill bodies only after verifying
shared replacements and local exceptions. Other repositories remain unchanged.

## Tracking setup and upgrades

Adoption never selects Uniwares as a consumer's project. Follow [project operations](project.md)
to inventory the target organization and obtain the user's reuse/dedicated/organization-wide
choice. Store it locally through handbook.json's optional tracking reference. Preserve
existing choices, accepted queues and project-specific overrides; assess shared improvements
before adding overrides. Preview external setup before applying authorized changes.
The tracking tools run together from the task snapshot; older integrations can omit tracking
until selection is authorized. Current Handbook project.json remains local-only.
