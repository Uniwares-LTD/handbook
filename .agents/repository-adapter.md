# Handbook repository adapter

Canonical policy: docs/work-policy.md. Project configuration: project.json and
docs/uniwares-project.md. Shared procedures: docs/project.md. Setup: README.md and docs/onboarding.md. Evidence lives in issues and PRs.
Default branch: main. Substantial work uses issues; trivial low-risk changes may be
untracked. No backlog migration is authorized by onboarding alone.

Run `npm run validate` for changes to helpers, templates, links, or skills. Record
actual failures: quality checks are advisory, while runtime/operational failures
remain failures. There is no application build or deployment here.
Shared skill changes preserve provenance, license/notice material and referenced
resources. Refresh integrity hashes only after reviewing intentional changes.

## Local ownership and navigation

Handbook's own source map is docs/source-map.md; it contains no consumer source map.
Shared authority is docs/work-policy.md. Domain guidance supplies reusable procedures;
this adapter owns Handbook commands and local constraints. Resolve real conflicts
explicitly without silently weakening shared authority or accepted local exceptions.
Templates: the issue forms in .github match the shared starters in .agents/templates (see
docs/templates.md); the PR template adds a policy approval section. Override freely.
Integration selection is handbook.json. Run npm run handbook:sync after changing skill
metadata, then npm run handbook:entrypoints. Reconcile customized wrappers manually.
