# Shared bootstrap and authority

Explicit session scope and higher-priority instructions control the task. Read
[work policy](work-policy.md) when an action depends on authority, lifecycle or branches,
and [project operations](project.md) when managing tasks, then the consumer's selected
tracking configuration and local policy. Shared guidance does not adopt or enroll a
repository. Read its local guidance, source map and repository preferences declared in
`handbook.json`; apply the preferences (such as the issue language) to the task; identify
conflicts and preserve accepted specializations rather than choosing a universal
local/shared winner.

For GitHub work and helpers that invoke Git/gh, follow
[GitHub access](work-policy.md#github-access), including outside-sandbox execution.

At task start run the consumer's `npm run handbook:check`. In Handbook itself use
`node scripts/handbook.mjs check --path .`. Always apply
[communication guidance](guidance/communication.md); load other
[domains](guidance/README.md) relevant to the work, not all skill bodies.

## Scale to the task

A small, low-risk task needs no planning artifact: read the shared files you need at the
returned revision and do the work. For issue intake and implementation, use the
[proportional workflow](guidance/engineering.md#choose-the-workflow); casual questions
do not start a delivery workflow. Retain the revision explicitly only when work spans
sessions, compaction/resume or a handoff to another agent or member:

- Keep the returned `path` and full `revision` in context and read policy, selected skills
  and their dependencies with `git -C PATH show REVISION:FILE`. Paths in those files
  resolve inside that revision.
- Carry the same path and revision through later skill calls, authorized delegation,
  handoffs and resume summaries. A concurrent refresh or `--force` does not change it.
  No separate baseline record is required; use the existing plan or handoff when present.
- If context loses the baseline, recover it from the handoff or conversation first; if
  impossible, establish a new baseline and report the discontinuity. Do not claim
  continuity that cannot be verified.

Reuse documents already read at the task revision. Skill entrypoints link directly to
their owning domain; open the domain index only when choosing additional guidance.
Consumer setup and recovery instructions live in the generated `.agents/handbook.md`;
its shared source is [consumer bootstrap](consumer-bootstrap.md).

For filesystem resources run `node scripts/handbook.mjs resources --path PATH --revision SHA`.
Use its `resourcePath`, preserving relative dependencies. It materializes committed
content under local Git metadata, rejects unsupported entries, and validates cached
content before reuse. Never edit a snapshot or execute a resource from the mutable
checkout in place of the task revision. Run project commands with the consumer as cwd.
External tools and online references remain external: cite their versions/evidence;
a Handbook revision does not freeze live websites or downloaded packages.

Without a usable baseline, continue under existing local instructions and pause only
decisions requiring unavailable shared policy. Setup and repair remain permitted within
scope. Local readiness warnings are separate from baseline availability and do not
automatically block work or CI. Missing facts may still prevent a particular decision.

See [onboarding](onboarding.md) for refresh, provenance and compatibility behavior.
