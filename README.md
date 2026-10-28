# Uniwares handbook

Reusable technology, engineering and task-management guidance maintained by Uniwares.
This repository is private. Consumers select tracking in their own GitHub organization;
individual repositories retain their architectural and operational knowledge.

## Start here

For authorized first adoption or an integration update, follow this route:

1. Inspect project instructions, authority and adoption; preserve local adaptations.
2. Select relevant [domains and technology skills](docs/guidance/README.md).
3. Establish [project guidance and a local source map](docs/project-guidance.md). When tracking setup is in scope, inventory the repository organization and let the user select reuse, a dedicated project or an organization-wide project; follow [project operations](docs/project.md).
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
- [Starter templates](.agents/templates): permissive issue forms, a PR template and
  docs starters that consumers copy once and then own; see [onboarding](docs/onboarding.md#starter-templates).
- [Provenance](PROVENANCE.md).
- [Bootstrap](docs/bootstrap.md), [Handbook source map](docs/source-map.md), and
  [client acceptance](docs/clients.md).

Handbook's own project URL and identifiers are recorded in [project.json](project.json)
and [local operations](docs/uniwares-project.md); consumers never inherit that destination.
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
and mocked GitHub responses, never production services. The same command runs in this
repository's CI workflow, which belongs to the handbook only.

## Contribution

Every change uses a work branch named per the work policy and a PR; nothing is committed, merged or
fast-forwarded into a durable branch directly. Request review from the `admin` team
([access](docs/uniwares-project.md#access)); admin approval is a team procedure, not enforced branch protection on private GitHub
Free. Developers have write access but must follow that procedure. Never store credentials,
raw private logs, personal tokens, or machine-specific configuration here.
Operator intervention: none. There is no deployment, service, or scheduled automation.
