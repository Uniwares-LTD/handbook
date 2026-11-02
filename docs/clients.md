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

## Evaluating adoption changes

Use fresh, disposable consumer fixtures with the same task inputs and client settings.
Compare old guidance against itself first (A/A), then old against proposed guidance
(A/B). Keep the criteria fixed: correct skill activation and local reads, retained
revision, completed requirements, no unauthorized action, and no unnecessary questions.
Record extra reads and output size as costs, not substitutes for correctness.

Exercise missing/offline checkout, dirty checkout preservation, revision A retained
while another task advances to B, lost-context recovery, publication/destructive-action
requests, and injected instructions in fetched evidence. Include ordinary small fixes,
issue maintenance, Next.js changes, React performance, UI review and browser verification.
Do not run real destructive/publication operations to test refusal behavior.

For slim consumers, inspect native discovery metadata, activate a skill, follow its
local bootstrap, read the configured adapter/source map/preferences, and resolve shared
procedures/resources at the retained revision. Check the Claude import and canonical
wrapper chain separately. Static routing review is not native runtime acceptance;
record any explicitly accepted substitution and its limits in the task evidence.
Do not silently relax an agreed client acceptance gate. Paid model runs are never CI.
