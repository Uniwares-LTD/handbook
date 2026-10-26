# Initialize and use shared guidance

Handbook is the shared source; consumers follow main without version pins or upgrade
PRs. Unibase is the first consumer. Infrastructure and unitale-mockup remain unadopted.
Project linking alone does not change instructions, permissions or queues.

## Unibase quick start

With Node.js, Git and read access to this private repository, run from Unibase:

```powershell
npm.cmd run handbook:setup
```

This creates the sibling handbook clone if absent, validates its origin and initializes
a synchronized baseline. No application dependency installation is required. For another
location use `-- --path PATH` or the local `UNIWARES_HANDBOOK_PATH` override.
Never commit a developer's absolute path or overwrite an unrelated existing directory.

At task start the agent runs `npm run handbook:check`. Within four hours it reuses the
cache; after four hours it fetches main and fast-forwards a clean checkout. Failed
attempts also get a four-hour cooldown. `npm run handbook:check -- --force` retries now.
This is a lazy command, not a scheduler. Normal checks never rewrite consumer files.

`npm run handbook:doctor` reports origin, cache age, checkout state and entrypoint
compatibility without fetching or writing. See Unibase's docs/agent-tooling.md for
troubleshooting and client acceptance checks.

## Cache behavior

The shared helper is `scripts/refresh-handbook.mjs`. From handbook itself run
`node scripts/refresh-handbook.mjs --path .`; it also supports `--force` and read-only
`--doctor`. It records successful synchronization and attempts in local Git metadata.
Other launchers should delegate to this helper rather than implement another refresh loop.

Dirty, diverged, ahead-of-main or non-main checkouts are preserved. Offline refresh uses
the last synchronized revision. Read guidance, skills and relative resources from that
revision with `git -C PATH show REVISION:docs/work-policy.md`, using the returned values.
Keep the baseline for the current task. Different members can use different recent
revisions; report limitations briefly when relevant, not on every action.

If no usable baseline exists, explain setup once, continue under existing local rules,
and pause only handbook-dependent decisions. Wrong-origin checkouts are rejected.
Do not reset, stash, discard changes or switch branches automatically. After an
interrupted refresh, inspect the lock PID in Git metadata before manually removing
an abandoned lock; never remove a lock belonging to a running refresh.

## Adopting another repository

Use an authorized consumer change to inventory and reconcile existing instructions.
Keep application architecture, operational ownership, build/test commands and verified
evidence in its repository adapter and canonical docs. Preserve explicitly accepted
legacy queues; use owning-repository issues for new substantial work. No bulk backlog
migration, credentials setup or project enrollment is implied.

Add the small Node launcher from Unibase's scripts/handbook.mjs and its three package
commands. Copy the six thin entrypoints under `.agents/skills` after reconciling any
local adaptations; do not copy shared procedure bodies. Preserve source provenance and
notices. Retain domain-specific skills locally. Do not install globally or use symlinks.

Add a concise AGENTS.md reference:

```markdown
At task start run `npm run handbook:check`. Read shared policy and relevant skills
from the returned handbook path/revision, plus this repository's adapter. Keep that
baseline for the task. Cached guidance is usable; pause only handbook-dependent
decisions if none is available. Preserve local work and explicit session authority.
```

Each local entrypoint keeps the shared name and a concise stable description, runs
the check only if the task has no baseline, and reads the matching shared SKILL.md
with git show. All its relative policy/role/resource references resolve in the same
handbook revision. Doctor warnings about descriptions are advisory; update wrappers
through ordinary reviewed edits, not automatically during checks.

Do not copy handbook's own AGENTS.md or adapter over consumer instructions. Reconcile
issue authority explicitly: agents can maintain assigned issue evidence/status/blockers;
new issues need human approval; humans control closure and Done. Publication, merging,
deployment, releases and permissions retain their separate authorization rules.

## Reading and writing documentation

| Need | Source/destination |
| --- | --- |
| Authority, readiness and acceptance | [Work policy](work-policy.md) |
| Project fields, access and enrollment | [Project operations](project.md) and [configuration](../project.json) |
| Issue writing and evidence | [Examples](examples.md) |
| Shared procedures and supporting contracts | `.agents/skills` and `.agents/agents` in the resolved handbook revision |
| Application behavior, setup and verified evidence | Consumer docs named in its adapter |
| New implementation/documentation queue | Issues in the owning repository; handbook for cross-repository coordination |

## Supported clients and acceptance

The initial supported clients are Codex VS Code extension and Codex desktop app,
using repository AGENTS.md and `.agents/skills` entrypoints. Each needs a fresh-session
check for discovery, relevant activation, local adapter reads, cached operation and
authority boundaries. Helper tests are not proof of client behavior. Record unavailable
client verification as pending; no other clients or cloud provisioning are implied.

Derived-project creation remains offline. It may copy public launcher/entrypoints but
does not clone handbook or enroll a repository. Its maintainer reviews inherited rules
and runs setup separately. No private cache or machine paths belong in generated projects.

## Contribution

Devs propose handbook changes by PR; Admin approval remains a documented procedure.
Clean synchronized main does not prove human review. No plugin marketplace, submodule,
version pin or scheduled updater is required for this workflow.
