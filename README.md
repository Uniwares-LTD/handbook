# Uniwares handbook

Shared technology, engineering and task-management guidance for Uniwares. This repository is
private. The organization project tracks implementation and documentation work;
individual repositories retain their architectural and operational knowledge.

## Start here

For authorized first adoption or an integration update, follow this route:

1. Inspect project instructions, authority and adoption; preserve local adaptations.
2. Select relevant [domains and technology skills](docs/guidance/README.md).
3. Establish [project guidance and a local source map](docs/project-guidance.md).
4. Follow [onboarding](docs/onboarding.md) to reconcile bootstrap and client references.
5. Initialize or refresh Handbook, retaining one committed revision for the task.
6. Run offline readiness/drift checks, read shared/local sources, and report evidence.

Use maintain-project for this workflow. Repetition preserves custom content; normal
refresh never rewrites instructions. Readiness warnings do not block CI. Project maps
and application facts belong in their owner repositories.

- **[Initialize and use the handbook in another repository](docs/onboarding.md):**
  clone setup, adoption PR checklist, AGENTS.md and skill entrypoint examples, and
  the task-start workflow for reading synchronized guidance and documentation.
- [Work policy](docs/work-policy.md): ownership, readiness, agent authority, completion.
- [Project operations](docs/project.md): fields, views, workflows, enrollment.
- [Examples](docs/examples.md): issue writing and evidence handoffs.
- [Provenance](PROVENANCE.md) and [verification](docs/verification.md).
- [Bootstrap](docs/bootstrap.md), [Handbook source map](docs/source-map.md), and
  [client acceptance](docs/clients.md).

The project URL and identifiers are recorded in [project.json](project.json).
Handbook and Unibase adopt this policy. Unibase retains already accepted milestone
queues; infrastructure and unitale-mockup retain their existing guidance. Project
association alone never adopts policy or migrates a queue.
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
