# Review depth, agent economy and manual QA across Handbook adopters

## Outcome

A maintainer starts an ordinary task in Handbook or an adopting repository. The selected workflow resolves the applicable rules, applies local preferences, chooses review depth and produces evidence the next stage can use. A delegated worker can find its role even when the consumer has no local role file. A tester can execute a manual test plan with the required access, setup and observable outcomes.

## Requirements and acceptance

| ID | Required behavior | Observable result |
| --- | --- | --- |
| V16 | Select one separate review for understood, localized, low-risk work. Select paired review for material risk, material uncertainty and existing large checkpoints. | Inert copy and an equally small permission change take different routes. A seeded authorization defect blocks the latter. Both reviewers receive the same diff and current checks. Existing fallback and repeated-blocker rules apply. |
| V17 | Evaluate an existing journey and its extension using expectations derived from its contract. Require evidence of equivalent failure handling before a simpler design can block delivery. | Both entry points exercise success, denial, transient failure and return to the initiating control for relevant roles. An alternative that loses retry behavior cannot support a complexity blocker. |
| V18 | Batch independent reads, keep small lookups in the parent, and scope delegated work to a question, the needed excerpt, and a short evidence-bearing answer. | A worker returns unresolved doubts or a long-running operation with its live handle and owner. The parent monitors that operation to completion and owns any second opinion. Fresh reviewers receive the review contract and evidence before the implementation narrative. |
| V19 | Identify approved plan instructions and the governing PRD at handoff. Keep mutable progress identifiable. | A worker can verify its source. Progress updates preserve the instruction fingerprint. A changed instruction, PRD or missing identity triggers reconciliation. A fresh session requests fresh authorization for pending session-scoped actions. |
| V20 | Deliver role guidance to both clients through their supported entry points. Provide an explicit opt-in model-tier pilot. | With both startup options omitted, a synced consumer receives the AGENTS.md session contract and the full communication guide through the Claude startup hook. The ordinary skill route also works when either or both are disabled. An opted-in consumer can verify the effective reviewer tier where supported. Existing model selections, custom wrappers, hooks, permissions and local role authority survive sync. |
| V21 | Measure cost and correctness on comparable tasks before choosing defaults. | Baseline and candidate records identify task, client, model, effort and actual route. Missing telemetry is visible. A cheaper run that misses a blocker is reported as a correctness regression. |
| Manual QA | Plan the whole tester journey. Preserve required coverage for the changed rule, money, access, refusals and prior failures where applicable. | A short single-login flow stays short. A multi-role or multi-day plan states setup owner, accounts, devices, waits, irreversible actions and expected results. A records-only check names an authorized verifier and the time and identifiers needed to reproduce it. |

## Sources and scope

Uniwares base is [dc22bea](https://github.com/Uniwares-LTD/handbook/tree/dc22bea). V16 and V17 extend earlier Handbook practices with [Voxr review cases](https://github.com/Jason-Richter-Enterprises/voxr-ai-app/pull/2180). V18–V21 draw on [Voxr agent economy](https://github.com/Jason-Richter-Enterprises/voxr-ai-app/pull/2185). Manual QA adopts the portable parts of a [deferred Voxr proposal](https://github.com/Jason-Richter-Enterprises/voxr-ai-app/pull/2178) as a Uniwares decision. Its production Investigator and product-specific roles stay with Voxr.

Delivery covers Handbook source, consumer integration, migration instructions, disposable adopters and available native-client evidence. An actual consumer rollout requires a named repository and authority for that repository. Cost thresholds, automatic compaction and provider-wide model defaults remain pilot variables. Review depth and retries follow the Handbook's authority and existing correction rules.

## Acceptance boundaries

The [implementation plan](implementation-plan.md) defines the default skill route, the optional managed Claude reviewer and the collision fallback. Every supported configuration must retain access to the pinned shared contract. Demonstrate that access in Handbook and a disposable adopter with no local role files. An integrity or drift check establishes structural compatibility. Native acceptance requires an observed run for each claimed client and repository kind. Cost conclusions require comparable measurements. Record a missing result against its own claim and continue independent verification.
