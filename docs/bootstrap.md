# Shared bootstrap and authority

Explicit session scope and higher-priority instructions control the task. Read
[work policy](work-policy.md) for action authority and [project operations](project.md)
when managing tasks. Shared guidance does not adopt or enroll a repository. Read its
local guidance and source map declared in `handbook.json`; identify conflicts and
preserve accepted specializations rather than choosing a universal local/shared winner.

At task start run the consumer's `npm run handbook:check`. In Handbook itself use
`node scripts/handbook.mjs check --path .`. Retain returned `path` and full `revision`
in conversation context. Read policy, selected skills and their text dependencies with
`git -C PATH show REVISION:FILE`. Paths in those files resolve inside that revision.
Load [domains](guidance/README.md) relevant to the work, not all skill bodies.

Every subsequent skill call, authorized delegation, handoff and compaction/resume
summary carries the same path and revision. A concurrent task refresh or `--force`
does not change it. No task record is written. If context loses the baseline, recover
it from the handoff/conversation first; if impossible, explicitly establish a new
baseline and report the discontinuity. Do not claim continuity that cannot be verified.

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
