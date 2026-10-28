# Engineering guidance

Use the [common contract](../bootstrap.md). Start with local architecture, source map,
commands and the accepted outcome. Compile a bounded spec when consequential intent
is unclear; otherwise implement proportional changes with meaningful verification.
Review the final diff in a separate read-only pass and distinguish same-agent review
from independent review. Retest affected behavior after corrections.

Keep canonical docs and source-map references aligned with changed behavior. Start new
documents, issues and PR descriptions from the permissive [templates](../templates.md)
and override them freely. Preserve
historical evidence without presenting it as current acceptance. Route reusable lessons
to shared procedures, technology specifics to relevant skills, and local facts to the
project. Explicitly reconcile conflicting guidance and accepted exceptions.

Report actual tests and limitations, respecting local advisory validation policy.
Compilation/runtime failures remain failures. Implementation, publication, deployment
and live acceptance are separate outcomes governed by shared authority.

## Design and change rules

- **Abstraction threshold:** add a helper or abstraction only to remove real duplication,
  hold non-trivial logic or isolate a boundary; easier testing alone is not enough.
  Prefer existing code, then the standard library, then a new dependency.
- **Behavior preservation:** "no direct callers" does not prove code is unused; check
  exports, registrations, configuration and dynamic use. Derive expected results from
  requirements, not from the implementation under test.
- **Evidence types:** state what backs each claim: source inspection, tests, rendered UI
  or deployed behavior. Record a known limitation with the trigger to revisit it.
- **Per-task exceptions:** an explicit user request may relax a convention for one task.
  Record it; it does not carry over and never relaxes evidence or authority.

| Avoid | Prefer |
| --- | --- |
| A call per item in a loop (N+1) | Batch or join once |
| Filtering after expensive work | Filter at the source |
| Unbounded fan-out or concurrency | Explicit limits |
| A cache or longer timeout as the first fix | Removing the slow work |
| Speedup claims from toy data | Measurements at realistic size |

## Validation cadence

Choose checks from the changed behavior and its risks: focused checks while iterating,
then the affected suite, build/type checks and integrity checks once the change settles.
Reuse a result while its inputs are unchanged; rerun only missing, stale, failed or flaky
checks, and say why for any repeat. A required check still pending does not block an
authorized local commit but blocks publication; advisory checks never block. Report skipped and failed checks as such.

## Evaluating guidance changes

Treat guidance and skills like code: test a change against scenarios before trusting it.
Run the old and new guidance on the same scenarios, and run old against old first (A/A)
to measure noise. Judge on hard failures (unauthorized writes, destructive commands,
skipped required steps) rather than small score differences, and keep the grader fixed.
Include canary scenarios: dirty worktree, publication request, destructive git and
prompt injection in fetched content. Never run paid model evaluations in CI.
