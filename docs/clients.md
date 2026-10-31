# Client references and acceptance

Checked against official documentation on 2026-10-27:

- [Codex customization](https://learn.chatgpt.com/docs/customization/overview#skills):
  AGENTS.md and `.agents/skills` provide repository instructions and skill discovery.
- [Claude memory](https://code.claude.com/docs/en/memory#share-one-file-with-other-coding-tools):
  keep `@AGENTS.md` in CLAUDE.md with Claude-specific content below it.
- [Claude skills](https://code.claude.com/docs/en/skills): project SKILL.md entrypoints
  under `.claude/skills` supply discovery; thin bodies read the canonical local entrypoint.

Run explicit handbook:sync and read-only handbook:entrypoints after changes to skill
metadata or routing. Preserve native configuration separately. Markdown does not register
hooks, subagents, tool permissions or executable dependencies.

## Acceptance procedure

In an actual Codex session with normal permissions, verify discovery, relevant activation,
local guidance/source-map reads, setup/check/doctor, cache reuse and actual refresh.
Record failures; never silently expand permissions or claim manual terminal success as
client proof. Retain revision A while another fixture task advances the baseline to B;
invoke another skill, read same-revision resources and carry A through handoff/resume.
Exercise lost-context recovery without claiming continuity after a new baseline.

Use this compact checklist for a new client session, including macOS:

- Confirm native discovery and activate one relevant skill; verify local guidance and source-map reads.
- Run setup/check/doctor and the offline readiness and entrypoint checks with the client's actual filesystem access.
- Retain the full Handbook revision and materialize resources from it; verify actual refresh separately from cache reuse.
- Resume the task and confirm the retained revision. Record any lost-context recovery or new baseline explicitly.

Record the client, environment, revision, observed results, and checks still pending. Existing-session activation does not prove fresh-session discovery.

Claude runtime acceptance is explicitly deferred. Remaining check: in Claude Code confirm
CLAUDE.md import, skill discovery/activation, canonical routing, local reads, retained
revision, resources and refresh under actual permissions. Static tests do not prove this.
