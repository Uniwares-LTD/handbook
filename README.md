# Uniwares handbook

Shared work-management policy and agent skills for Uniwares. This repository is
private. The organization project tracks implementation and documentation work;
individual repositories retain their architectural and operational knowledge.

## Start here

- **[Initialize and use the handbook in another repository](docs/onboarding.md):**
  clone setup, adoption PR checklist, AGENTS.md and skill entrypoint examples, and
  the task-start workflow for reading synchronized guidance and documentation.
- [Work policy](docs/work-policy.md): ownership, readiness, agent authority, completion.
- [Project operations](docs/project.md): fields, views, workflows, enrollment.
- [Examples](docs/examples.md): issue writing and evidence handoffs.
- [Provenance](PROVENANCE.md) and [verification](docs/verification.md).

The project URL and identifiers are recorded in [project.json](project.json).
Only handbook adopts this policy initially. Linking unibase, infrastructure, and
unitale-mockup to the project does not replace their existing instructions or queues.
No historical backlog is imported during bootstrap.

Reading the handbook requires repository read access. Adopting it is an explicit
consumer-repository change: follow the initialization guide before replacing local
instructions or skills. Merely cloning or linking the repository does not adopt policy.

## Local checks

Requires Node.js 22+, Git, and GitHub CLI for connected operations. No npm dependencies.
Run `npm run validate` from this repository. Tests use disposable local Git repositories
and mocked GitHub responses, never production services.

## Contribution

Use a branch and PR for subsequent policy changes. Request review from the Admins team;
Admin approval is a team procedure, not enforced branch protection on private GitHub
Free. Devs have write access but must follow that procedure. Never store credentials,
raw private logs, personal tokens, or machine-specific configuration here.
Operator intervention: none. There is no deployment, service, or scheduled automation.
