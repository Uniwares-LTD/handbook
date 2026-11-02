---
name: "playwright"
description: "Use when the task requires automating a real browser from the terminal (navigation, form filling, snapshots, screenshots, data extraction, UI-flow debugging) via `playwright-cli` or the bundled wrapper script."
---


Follow [bootstrap](../../../docs/bootstrap.md) and
[technology guidance](../../../docs/guidance/technology.md), reusing reads at the task revision.
Read the consumer's guidance before applying these references.

# Playwright CLI Skill

Drive a real browser from the terminal using `playwright-cli`. Prefer the bundled wrapper script so the CLI works even when it is not globally installed.
Treat this skill as CLI-first automation. Do not pivot to `@playwright/test` unless the user explicitly asks for test files.

On Windows, use `npx.cmd --yes --package @playwright/cli playwright-cli`
with a named session and headless defaults. Keep captures under `output/playwright/`.
The Bash wrapper is `scripts/playwright_cli.sh` relative to this skill in the task revision snapshot;
do not assume this vendored skill lives in the system skills directory. Do not
change global tool configuration or install a global package merely to run it.

## Prerequisite check (required)

Before proposing commands, check whether `npx` is available (the wrapper depends on it):

```bash
command -v npx >/dev/null 2>&1
```

On Windows use `Get-Command npx.cmd` for this check. If Node/npm is missing, report
that dependency and the repository's pinned versions. Installing the CLI globally
is unnecessary: use the vendored wrapper or `npx.cmd --package @playwright/cli`.
Reuse an already installed local CLI when available. Follow the repository adapter
for local browser caches, named sessions, RTL and document-CSP verification.

## Skill path (set once)

```bash
# Set PWCLI to .agents/skills/playwright/scripts/playwright_cli.sh under
# resourcePath returned by handbook.mjs resources --revision SHA.
# Do not use the mutable Handbook checkout or a system installation.
```

Run commands from the consumer repository root; the wrapper path must come from the task revision snapshot.

## Quick start

Use the wrapper script:

```bash
bash "$PWCLI" open https://playwright.dev
bash "$PWCLI" snapshot
bash "$PWCLI" click e15
bash "$PWCLI" type "Playwright"
bash "$PWCLI" press Enter
bash "$PWCLI" screenshot
```

If the user prefers a global install, this is also valid:

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
```

## Core workflow

1. Open the page.
2. Snapshot to get stable element refs.
3. Interact using refs from the latest snapshot.
4. Re-snapshot after navigation or significant DOM changes.
5. Capture artifacts (screenshot, pdf, traces) when useful.

Minimal loop:

```bash
bash "$PWCLI" open https://example.com
bash "$PWCLI" snapshot
bash "$PWCLI" click e3
bash "$PWCLI" snapshot
```

## When to snapshot again

Snapshot again after:

- navigation
- clicking elements that change the UI substantially
- opening/closing modals or menus
- tab switches

Refs can go stale. When a command fails due to a missing ref, snapshot again.

## Recommended patterns

### Form fill and submit

```bash
bash "$PWCLI" open https://example.com/form
bash "$PWCLI" snapshot
bash "$PWCLI" fill e1 "user@example.com"
bash "$PWCLI" fill e2 "password123"
bash "$PWCLI" click e3
bash "$PWCLI" snapshot
```

### Debug a UI flow with traces

```bash
bash "$PWCLI" open https://example.com --headed
bash "$PWCLI" tracing-start
# ...interactions...
bash "$PWCLI" tracing-stop
```

### Multi-tab work

```bash
bash "$PWCLI" tab-new https://example.com
bash "$PWCLI" tab-list
bash "$PWCLI" tab-select 0
bash "$PWCLI" snapshot
```

## Wrapper script

The wrapper script uses `npx --package @playwright/cli playwright-cli` so the CLI can run without a global install:

```bash
bash "$PWCLI" --help
```

Prefer the wrapper unless the repository already standardizes on a global install.

## References

Open only what you need:

- CLI command reference: `references/cli.md`
- Practical workflows and troubleshooting: `references/workflows.md`

## Guardrails

- Always snapshot before referencing element ids like `e12`.
- Re-snapshot when refs seem stale.
- Prefer explicit commands over `eval` and `run-code` unless needed.
- When you do not have a fresh snapshot, use placeholder refs like `eX` and say why; do not bypass refs with `run-code`.
- Use `--headed` only when the user requests an interactive window; otherwise capture screenshots headlessly.
- When capturing artifacts in this repo, use `output/playwright/` and avoid introducing new top-level artifact folders.
- Default to CLI commands and workflows, not Playwright test specs.

## Workflow contract

Use the [technology task contract](../../../docs/guidance/technology.md#applying-technology-skills).
Report evidence and limitations; review-only requests remain read-only.
