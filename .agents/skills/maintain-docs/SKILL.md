---
name: maintain-docs
description: "Sets up a repository's documentation and templates from the Handbook starters, writes new documents from templates, restructures docs and refreshes local templates on request. Use when setting up docs or templates in a repository, writing a new guide, runbook, how-to, spec or decision record, reorganizing docs, or updating a template."
---

# Maintain Docs

Read [bootstrap](../../../docs/bootstrap.md) for the task baseline and authority, then
[templates](../../../docs/templates.md) and relevant [domain guidance](../../../docs/guidance/README.md).

Read the repository guidance, source map and handbook.json. Inspect existing documents
before writing. Extend the nearest canonical document instead of starting a parallel one.

To start docs or templates in a repository:

1. Materialize resources at the task revision, then preview with
   `npm run handbook:templates -- --source SNAPSHOT`.
2. Copy missing files with `--write`. Never replace an existing file unless the user
   names it; then use `--update PATH`.
3. Fill the copied adoption documents from repository evidence. Mark unknowns; do not
   invent owners, commands or architecture.
4. Record the template locations in the repository guidance, and link canonical documents
   from the source map.

To write a new document, use the matching template: the local copy first, otherwise the
shared starter at the task revision. Follow its headings, fill in what is known and delete
sections that do not apply; never delete the preferences lines or the five source-map
headings, which readiness parses.

To restructure documents, move or merge content so each fact has one home, rewrite rather
than append corrections, and update source-map links.

Refresh a template from its shared starter only when the user asks. Show the differences
first, then use `--update` with the named file.

Run `npm run handbook:ready` and the repository's own link or docs checks after changes.

## Workflow contract

Trigger: Setting up a repository's documents or templates, writing or restructuring a document, or refreshing a template.

Inputs and sources: Repository guidance, source map, handbook.json, existing documents and the shared starters at the task revision. Shared authority is [work policy](../../../docs/work-policy.md); project facts remain in local canonical sources.

Permitted actions and completion: Local documents and templates are created or updated with source-map links, and checks are reported. Existing files are never silently replaced, and nothing is published externally.

Aligning existing docs with verified changes, and fixing stale facts or links, belongs to
sync-docs-issues. Keep changing facts in one place and link to them.
