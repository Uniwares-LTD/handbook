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

Claude runtime acceptance is explicitly deferred. Remaining check: in Claude Code confirm
CLAUDE.md import, skill discovery/activation, canonical routing, local reads, retained
revision, resources and refresh under actual permissions. Static tests do not prove this.
