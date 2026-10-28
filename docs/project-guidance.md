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
The [starter templates](onboarding.md#starter-templates) include a source map, guidance and
preferences file to begin from.
Update it when navigation or boundaries change, not on every file edit.

Optionally add a task routing table so agents load only what a task needs:

| Task | Start here | Add when applicable | Verification |
| --- | --- | --- | --- |
| Change the API | `docs/api.md` | `docs/auth.md` for protected routes | `npm test -- api` |

Give each task one row. A link is context, not authority. Scoped instruction files open
with an "Applies to `<path>/**`" line; a deprecated area keeps a short stub pointing to
its replacement.

`handbook.json` declares version 1, `kind` (`consumer`, or `source` for Handbook itself),
repository-relative `guidance`, `sourceMap`, `preferences`, and a `technologySkills`
array. References may name Markdown anchors. Do not store absolute machine paths or
baseline pins here. AGENTS.md must name the guidance and source-map references and the
baseline command.

## Repository preferences

`preferences` names a short Markdown file of repository-level choices that agents load at
task start, conventionally `.agents/repository.md`. Guidance refers to these settings
instead of repeating them. Record a preference only from the user's answer, and change it
only on the user's instruction. Readiness warns when a consumer has no preferences file or
when a required preference is missing or invalid.

Two preferences are required, each written as one line:

```markdown
## Work tracking

- Issue language: English

## Branches

- Integration branch: main
- Deployment branches: _staging (from main), _production (from _staging)
```

**Issue language:** English (the default) or Persian. Ask the user during project and
workflow setup; record English when they have no preference. The language applies to
issue titles, bodies and issue comments, including evidence comments. Labels, issue
types, project fields and options, status names and branch names stay in English.

**Branches:** the integration branch is `main` or `dev` and must be the repository's
default branch. Deployment branches are optional; list each as `_<environment> (from
<source>)`, where the source is the integration branch or an earlier deployment branch,
or write `none`. During setup, propose values from the repository's actual default and
`_`-prefixed branches and confirm them with the user. The
[work policy](work-policy.md#branches-and-integration) defines how each is used.

Run `node scripts/handbook-integration.mjs check` offline. It checks metadata, files,
required map sections, local links/anchors, selected skill metadata and instruction
routing. Warnings exit successfully; execution/usage errors remain failures. It does
not check external URLs or establish prose accuracy, ownership authority or completeness.
No private clone, authentication, Git or network is needed for this check.

`tracking` names the consumer's repository-relative tracking JSON and is required for
an adopted repository; readiness warns when it is missing. Its absence does not block
unrelated work, but tracking operations require the recorded choice (organization-wide
by default; see [project operations](project.md)).
Keep organization/project identity, included repositories, field/status mappings and
local policy references there. See [project operations](project.md). Readiness checks
validate declared local references offline, not live permissions or remote accuracy.
