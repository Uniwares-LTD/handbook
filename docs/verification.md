# Bootstrap verification

## Tracking defaults, auto-add and branch workflow — 2026-10-27

Shared guidance now requires every adopted repository to record one tracking project:
an existing project, an organization-wide project (the default) or a dedicated
repository project. Offline readiness warns when a consumer omits `tracking`; one new
fixture test covers that warning and the existing consumer fixture records a project.
GitHub's native auto-add workflow (`is:issue is:open`) is the default enrollment path;
explicit enrollment remains for repositories a plan's single Free-tier workflow cannot
cover and for pre-existing issues. The preview tool lists enabling it as a manual step.
Handbook's local record names the handbook repository as the auto-add source for project #2.

Work policy gains a branches-and-integration rule: edit only on an issue branch named
`<issue-type>/<issue-number>-<issue-slug>`, integrate through a PR, and never commit, merge or fast-forward into
main directly. AGENTS.md, work-on-task and the implementation contract route to it.
This change itself started on main before that rule existed; the uncommitted edits were
moved to a branch before any commit, and main was not modified.

Project operations now lists the browser-only workflow steps and a setup acceptance
checklist; maintain-project reports setup as partial until it is met.

`scripts/create-issue.mjs` lets agents create an approved issue and add it to the recorded
tracking project in one step, so agent-created issues no longer depend on auto-add. Preview
is read-only; apply requires the preview fingerprint, creates once, reuses an auto-added
item, fills an empty Status with Backlog, sets Blocked and reads both back. Add-plus-readback
moved from `reconcile` into the shared `enrollItem`, beside shared single-select read/write
helpers that pass GraphQL variables. Six fixture tests cover preview validation without
reading project items, duplicate refusal, plain-word paginated search and incomplete-search
refusal, fingerprint binding, single creation with field readback, auto-added Status reported
by name, `--resume` after a tracking failure, and an uncertain creation caught by the
exact-title recent-issue check. A same-agent code review found these defects before
publication; the fixes and regression tests address them. The
helper has not been run against live GitHub; the first approved issue it creates is the
live check.

Repository preferences: `handbook.json` gains a `preferences` reference to a Markdown file
(`.agents/repository.md` here) that agents load at task start. Its required issue language
(English by default, or Persian) governs issue titles, bodies and comments; labels, types,
fields, statuses and branch names stay English. Project setup asks for it and its setup
acceptance checks it. Readiness warns when a consumer omits the file or the value is
missing or invalid; one fixture test covers those cases. Handbook records English.
`npm run validate` passed 47 of 47 tests with clean readiness and entrypoint checks.

Project #2 setup acceptance, checked 2026-10-27:

- Met: handbook.json records `project.json`; readiness reports no tracking warning.
- Met: [handbook#5](https://github.com/Uniwares-LTD/handbook/issues/5), created before
  auto-add, was enrolled with `enroll.mjs --apply` (first attempt failed on the network
  with no write; readback confirmed zero items before the retry). Item added set Status to
  Backlog; Blocked was set to Not blocked. The helper reports no missing open issues.
- Met: workflow readback shows Item added and Item reopened on; Item closed, Auto-close
  issue, Auto-add sub-issues and both pull-request workflows off.
- Pending: no Auto-add to project workflow exists yet; a human must create it in the
  browser for the handbook repository with `is:issue is:open`.
- Pending: the first real handbook issue after that must appear in Backlog unaided.

## Generic tracking and project #2 migration — 2026-10-27

Shared guidance now separates consumer-owned tracking from Handbook's local Uniwares
configuration. Inventory/preview/apply, explicit enrollment and human-closure mirroring
use consumer configuration; no consumer implicitly enrolls in Uniwares.

Before live migration, `npm run validate` passed all 37 tests, skill integrity/link
checks, offline structural readiness and generated-entrypoint drift checks. Execution
required child-process escalation. The enrollment identity correction and its affected
tests were rerun successfully. A final read-only readiness-reporting addition passed
all nine tracking tests (38 tests across the current suite). These tests use mocked
GitHub APIs, including two unrelated organizations; they are not live API certification.
A separate same-agent read-only implementation review preceded live changes. Final
review covered the readiness addition and migration records; no independent-agent review
is claimed. A subsequent PR-preparation review found that option colors were emitted
as quoted strings in GraphQL input. The serializer now validates and emits color enum
literals for both created and preserved options; regression coverage includes GitHub's
initial Status field, retained option IDs and quoted descriptions.
After this correction, `npm run validate` passed all 39 tests, integrity/link checks,
offline readiness and entrypoint drift checks. The separate same-agent final review
found no remaining blocking defect; live Projects API execution remains unverified.

The signed-in browser refreshed project #2 immediately before migration: the project
was still empty with seven views. Applied and read back:

- Added Cancelled after Done, retaining the other five status options.
- Disabled Item closed; only Item added and Item reopened remain enabled, both to Backlog.
- Renamed Overview to Active work, made it a Status board with `is:issue is:open`,
  and retained it as the first/default view.
- Renamed Status board to Triage, a table with
  `is:issue is:open -status:"Ready","In progress","In review"`.
- Added Review (`is:issue is:open status:"In review"`) and History (`is:issue is:closed`)
  tables. History includes Closed and native issue-state reasons.
- Retained My items, Blocked, By repository, Priority board and Roadmap: nine views total.
- Updated the project README with closure distinctions, readiness, local coordination
  and consumer-owned destination choice; verified persistence after reload.

Project identity, privacy, access, repository links and default issue repository were
not changed. No issues, draft items or demonstration projects were created. No other
project or Unibase files were modified. The live project settings are applied; this
Handbook code/documentation publication and merge status is recorded by the PR containing
this change. Unibase must consume the merged main revision, not this mutable working tree.

Limitations: the CLI credential still lacks `read:project`; API mutations and enrollment
were fixture-tested, not exercised live. No scopes were changed. Workflow behavior is
configuration-verified only, pending an authorized real issue. Normal client Git spawning
still reports `spawnSync git EPERM`; successful elevated tests do not resolve actual
client-permission verification. Claude runtime checks remain deferred. Earlier sections
below are historical snapshots, superseded by this section for current project settings.

See the [Unibase handoff](unibase-tracking-handoff.md) for later consumer work.

## Shared guidance and project ownership — 2026-10-27

Review corrections: candidate validation now parses and links real named exports without
executing candidate code, so comments/string literals cannot conceal a missing export.
Doctor catches malformed consumer metadata and returns actionable warnings alongside
baseline diagnostics. The full validation suite passed 29 tests with explicit
child-process escalation, including both regressions. A full-change same-agent review
also removed the redundant launcher string check so valid export aliases can load.

Handbook implementation is local and unpublished. Unibase was read as an import source
and remains unchanged; its adoption update waits for Handbook review and merge into main.
Infrastructure and unitale-mockup were not modified or adopted. No issues, projects,
backlogs, permissions, deployments, commits or publication were created by this change.

The shared inventory now has eleven skills: the original six, maintain-project, and
four reusable technology/UI imports. [Domains](guidance/README.md) route them;
[provenance](../provenance/technology-imports.json) retains import identities and hashes.
Project-owned guidance/source maps, warning-only validation, explicit client sync and
the staged migration route are documented in [onboarding](onboarding.md).

Verification performed:

- `npm.cmd run validate` passed all 26 tests plus static links/frontmatter/integrity,
  readiness and entrypoint checks with explicit child-process escalation. Fixtures
  use disposable local repositories and mocked APIs, not production services.
- After the final snapshot-directory correction, both affected tests passed again:
  task A resources across refresh/resume, and the actual complete Handbook candidate.
  Static checks were repeated after the Playwright documentation portability correction.
- Six standalone offline integration tests passed under normal sandbox permissions
  using `node --test --test-isolation=none test/integration.test.mjs`.
- Coverage includes fresh/repeat setup, offline cooldown, origin rejection, checkout
  preservation, concurrent refresh, incompatible helper/protocol/resource fallback,
  dirty/ahead helper provenance, read-only doctor, source-map warnings, wrapper drift,
  custom-content preservation, and executable/binary revision-A resources after B.
- Same-agent separate read-only review covered the final code, documentation, import
  changes and authority boundaries. No independent-agent review is claimed.
- `git diff --check` passed; the Unibase worktree remained clean.

Actual Codex session limitations: the original task-start refresh and the new launcher
doctor both failed under normal permissions with `spawnSync git EPERM`. The normal
test runner also failed before executing tests with `spawn EPERM`; escalated fixture
success does not prove unrestricted client operation. Existing shared skills were
available in this session and local guidance was read, but fresh-session discovery of
the new inventory and a successful normal-permission refresh remain pending.

Remaining Codex checks: in each supported Codex VS Code/desktop client, verify fresh
discovery/activation of maintain-project and selected technology skills, local guidance
and source-map reads, setup/cache/actual refresh under effective permissions, and task-A
baseline retention through subsequent native skill invocation and compaction/resume.
Fixture handoff serialization proves resource selection, not model memory behavior.
Claude runtime acceptance is explicitly deferred; its exact checks are in
[client acceptance](clients.md). Neither client receives expanded permissions here.

Operator intervention: none. Publication, human review/merge, and the later Unibase
integration update remain separate from this implementation evidence.

## Lazy refresh and consumer onboarding — 2026-10-26

The follow-up change adds four-hour lazy refresh, attempt cooldown, read-only diagnosis
and concurrent-refresh protection. All twelve handbook tests and static checks passed.
The dependent Unibase launcher passed five fixture tests and an end-to-end local Git
test covering setup, cache reuse, shared resource reads, offline operation and a dirty
helper. Its skill/docs checks and derived-project initializer fixture also passed.
The current change was reviewed in a separate read-only pass by the same agent.
No independent-agent or fresh-session client acceptance is claimed. Codex VS Code
extension and desktop app acceptance remain pending; see [onboarding](onboarding.md).
Publish handbook before the dependent Unibase change; merge/activation are separate
from this implementation evidence. No live issue event was exercised.

The remaining record describes the original bootstrap and its then-current adoption state.

Verified on 2026-10-26. [Uniwares project #2](https://github.com/orgs/Uniwares-LTD/projects/2)
and [handbook](https://github.com/Uniwares-LTD/handbook) are private.

## Published configuration

- Project organization base role Read; Admins Admin; Devs Write. Handbook inherits
  organization Read, with explicit Admins Admin and Devs Write. Creator/organization
  owner administrative access remains. Policy approval is procedural on private Free.
- All four repository Projects pages show Uniwares #2: handbook, unibase,
  unitale-mockup and infrastructure. Handbook is the default issue repository.
- Five ordered statuses, P0-P3 priorities, two blocker values, five sizes and both
  dates are configured. Priority has no default. Native metadata is retained.
- Seven saved views were read back: Overview has no filter; Status board and
  Priority board use `is:issue is:open` and their respective grouping; My items uses
  `is:issue is:open assignee:@me`; Blocked uses `is:issue is:open blocked:Blocked`;
  Roadmap uses `is:issue is:open` with Start date/Target date bindings; By repository
  uses `is:issue is:open` grouped by Repository.
- Overview retains native issue state icons (completed versus not planned) and
  the Closed date. Closure reasons are not collapsed into a custom status value.
- Exactly three workflows are enabled: added to Backlog, closed to Done, reopened
  to Backlog. Auto-close, auto-add sub-issues, PR linked and PR merged are Off;
  auto-add, auto-archive, changes requested and review approved are disabled.
- The unfiltered project is empty. No issues, draft items, test issues or backlog
  imports were created. Handbook has zero open issues.

## Local validation and review

`npm run validate` passed: six skill frontmatters and integrity hashes, local Markdown
link targets, four JSON-compatible YAML issue forms, and nine helper fixture tests.
The tests cover clean fast-forward, dirty preservation, missing baseline, wrong origin,
offline fallback, ahead/diverged/non-main checkouts, report-only and duplicate enrollment,
failed APIs, invalid issue references, and project lookup by organization/number.
Tests use local repositories and mocked APIs, with no live issue mutations.

A separate read-only review pass was performed by the same agent; no independent
agent review is claimed. Upstream provenance and supporting role/resource contracts
were retained. The optional upstream Python skill validator could not run because
PyYAML was unavailable; the repository's dependency-free validation passed.

## Acceptance boundaries and deferred work

Event-driven workflows are configuration-verified only. The first approved real
issue must verify added/reopened/closed behavior; no disposable issue was used.
The local GitHub CLI credential lacks Projects scope, so connected enrollment was
not exercised live. The helper requires ordinary interactive Projects read access
for reports and write access for explicit additions; no persistent automation token
or scheduled service was installed.

Project #1 was not edited. Existing repository content, permissions, instructions,
skills and queues were not changed; only requested project associations were added.
The original unibase worktree remained clean. No deployment or operator installation
is required. Consumer adoption, conflict reconciliation, thin skill entrypoints and
queue migration remain separate authorized work described in [onboarding](onboarding.md).
