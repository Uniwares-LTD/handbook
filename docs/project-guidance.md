# Project-owned guidance and source maps

Each adopted project owns guidance (or an adapter routing to it), a compact source map,
and agent entrypoints connecting those sources to shared guidance. Handbook maintains
its own map, never a catalog of consumer internals. A consumer map found here belongs
in its owner repository during an authorized consumer update.

Guidance identifies architecture, terminology, commands, invariants, operational owners,
constraints and accepted exceptions, linking canonical documents instead of copying
their bodies. Declare how shared and local rules fit; resolve contradictions explicitly.

The map is navigation, not compiler output or an exhaustive file inventory. Use these
nonempty headings, with explicit unknowns where evidence is unavailable:

- **Components:** important code areas and entrypoints.
- **Documentation:** canonical architecture, behavior, setup and operations references.
- **Commands:** links to authoritative build/test/check definitions.
- **Generated areas:** generated versus manually maintained boundaries.
- **Ownership:** verified owners, constraints and evidence locations.

It may be a standalone document or a section (for example `docs/architecture.md#source-map`).
Update it when navigation or boundaries change, not on every file edit.

`handbook.json` declares version 1, `kind` (`consumer`, or `source` for Handbook itself),
repository-relative `guidance`, `sourceMap`, and a `technologySkills` array. References
may name Markdown anchors. Do not store absolute machine paths or baseline pins here.
AGENTS.md must name both references and the baseline command.

Run `node scripts/handbook-integration.mjs check` offline. It checks metadata, files,
required map sections, local links/anchors, selected skill metadata and instruction
routing. Warnings exit successfully; execution/usage errors remain failures. It does
not check external URLs or establish prose accuracy, ownership authority or completeness.
No private clone, authentication, Git or network is needed for this check.

Optional `tracking` names the consumer's repository-relative tracking JSON. Missing
selection does not block unrelated work; tracking operations require an explicit choice.
Keep organization/project identity, included repositories, field/status mappings and
local policy references there. See [project operations](project.md). Readiness checks
validate declared local references offline, not live permissions or remote accuracy.
