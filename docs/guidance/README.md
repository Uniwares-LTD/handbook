# Guidance domains

All domains use [bootstrap and authority](../bootstrap.md). Projects select technology
and practice skills in `handbook.json`; load only guidance relevant to the authorized work.

| Domain | Responsibility | Skills |
| --- | --- | --- |
| [Communication](communication.md) | When to ask, output for its audience, plain writing, workflow adherence; applies to every task | all; asd-ste100 for text agents or other readers must parse without ambiguity |
| [Technology](technology.md) | Language, framework, database, platform and tool practices | next-best-practices, vercel-react-best-practices; playwright for browser tooling |
| [Engineering](engineering.md) | Design, implementation, testing, review, documentation and delivery | compile-feature-spec, work-on-task, review-change, sync-docs-issues, maintain-docs, capture-project-learnings; promote-to-environment and operate-data for approved deployment/data operations; grilling to settle a plan, diagnosing-bugs for hard bugs, ponytail for focused simplification; web-design-guidelines and playwright when relevant |
| [Task management](task-management.md) | Project/task creation and maintenance, readiness, ownership, acceptance and evidence | maintain-project, manage-issues |

Skills stay under `.agents/skills` for discovery and compatibility. Domain membership
is routing, not an exclusive taxonomy or a second independently maintained procedure.

## Choosing outside skills

Guidance should remove friction, not add it. Adopt an outside skill only when it is a
single, on-demand skill in plain SKILL.md form that works in every supported client,
has a permissive license, and fills a gap the shared skills leave. Read every file,
pin the source revision, and record the decision in [provenance](../../PROVENANCE.md#adoption-decisions).
Avoid bundles that impose mandatory gates, always-on rule sets or session-start hooks.

Reviewed candidates not yet imported; select them when a project needs one:

| Skill | Source and license | Use |
| --- | --- | --- |
| tdd | [mattpocock/skills](https://github.com/mattpocock/skills), MIT | Red-green-refactor in vertical slices |
| handoff | mattpocock/skills, MIT | Compact context handoff to another agent or session |
| writing-guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), MIT | Documentation style pass; overlaps asd-ste100, so pick one |
| skill-creator | [anthropics/skills](https://github.com/anthropics/skills), Apache-2.0 | Writing and evaluating skills, for Handbook maintainers |
| webapp-testing, mcp-builder | anthropics/skills, Apache-2.0 | Web app testing and MCP server work |
| differential-review, static-analysis | [trailofbits/skills](https://github.com/trailofbits/skills), CC-BY-SA-4.0 | Security review; share-alike license, so reference rather than vendor |
| ponytail-review | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail), MIT | Plain-English quality review; overlaps review-change |
