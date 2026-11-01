# Issue and handoff examples

## Documentation Task

Title: Document the local restore rehearsal prerequisites.
Outcome: A contributor can identify required fixtures and run the isolated rehearsal.
Scope: Correct the owning repository's guide; no live restore or credential changes.
Acceptance: Commands resolve to existing tooling; required inputs and expected output
are documented; links validate; limitations distinguish fixture tests from live recovery.
Type: Task. Label: documentation. Priority and human owner are set during triage.

## Cross-repository initiative

Keep the coordination Task in the organization's selected coordination repository with `initiative`, a measurable outcome and
links to approved child issues in their owning repositories. Dependencies use native
blocked-by relationships when available, otherwise explicit issue links. Do not duplicate the children's implementation checklists.

## Proportional delivery

- A typo fix: make the change, validate it and review it; report the result without
  a sizing announcement, plan document or extra issue comment.
- A bounded retry change affecting timeout and error paths: explain the medium route,
  resolve behavior and verification in Plan mode, then implement and review separately.
- A feature spanning billing data, permissions and several user flows: interview against
  the code, settle the PRD, plan verifiable checkpoints and human gates, then implement
  with two clean reviews per checkpoint. The final pair reviews the integrated change.
- A one-line authorization change: assess its impact rather than its line count;
  use at least the medium route to resolve security behavior and acceptance.

Accepted artifacts can satisfy stages already completed. Read-only issue lookups do
not start delivery. Uncertainty calls for targeted discovery, not automatic paperwork.

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
