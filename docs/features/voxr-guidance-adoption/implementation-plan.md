# Voxr guidance adoption implementation plan

[Requirements and acceptance](prd.md) cover the twelve selected practices.
Implementation starts from Handbook revision `f4126772752f352e9c5842bc0ed285f37784254f`.

| Checkpoint | Boundaries and verification |
| --- | --- |
| Communication and autonomy | V10–V13 extend the existing audience, authority and work-on-task rules. Check workflow cases WF-01 through WF-03 for communication, authority scope and routing. |
| Review and delivery | V2, V3, V5 and V7 extend large-work reviews, PR templates, promotion and issue guidance. Review the test-flow prompt and run the disposable Git conflict and rollback fixture. Use WF-04 through WF-06 for behavior that relies on agent judgment. |
| Consumer upgrades | V9 and V15 add the optional consumer boolean, managed hook, revision-local contract validation and upgrade coverage. Check opt-in, opt-out, malformed or oversized source, existing settings, repeated sync, and recovery after an incomplete skill rename. |
| Evaluation and handoff | V8 and V14 define the fixture revision and comparable sampling in the client guide. Check the fixture index in CI and record native runs separately when the clients are usable. |

## Verification and continuation

Use two separate read-only passes under the entry baseline for this delivery.
Verify the final integrated diff against the requirements and note same-agent
review when independent reviewers are unavailable. Run `npm run handbook:sync`,
`npm run handbook:entrypoints`, `npm run validate`, and `git diff --check`.

Use the [client guide](../../clients.md#workflow-behavior-scenarios) and
[onboarding](../../onboarding.md#session-contract-and-claude-workflow-routing) for fresh-session
acceptance. Report this evidence separately from deterministic tests and cost
samples. A client or authentication gap leaves the affected native result pending.
The local branch is the implementation handoff.
