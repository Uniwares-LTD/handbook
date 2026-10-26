# Bootstrap verification

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
