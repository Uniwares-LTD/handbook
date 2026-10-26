# Issue and handoff examples

## Documentation Task

Title: Document the local restore rehearsal prerequisites.
Outcome: A contributor can identify required fixtures and run the isolated rehearsal.
Scope: Correct the owning repository's guide; no live restore or credential changes.
Acceptance: Commands resolve to existing tooling; required inputs and expected output
are documented; links validate; limitations distinguish fixture tests from live recovery.
Type: Task. Label: documentation. Priority and human owner are set during triage.

## Cross-repository initiative

Keep the coordination Task in handbook with `initiative`, a measurable outcome and
links to approved child issues in their owning repositories. Dependencies use native
blocked-by relationships. Do not duplicate the children's implementation checklists.

## Suggesting an issue

Give the member the proposed repository, title, outcome, bounded scope, acceptance,
and duplicate search result. Ask for approval before creating it. A discovery does
not expand the current assignment or authorize a new priority/assignee.

## Evidence handoff

- Outcome: what changed and which acceptance criteria are satisfied.
- Evidence: exact checks, outcomes, and reviewed revision/diff; failures and limitations.
- Documentation: canonical files updated, or why none are needed.
- Review: separate read-only pass and resolved/actionable findings.
- Delivery: local / published / merged / deployed / live accepted, as applicable.
- Next action: member acceptance and closure, or a concrete remaining blocker.

Post evidence once at meaningful transitions; update a clearly agent-owned summary
when appropriate rather than posting repetitive logs. Never include secrets or raw
operator transcripts. Use ordinary PR references, for example “Related to #123”.
