# Unibase tracking handoff

Review and finalize Unibase's consumer-owned tracking after the generic Handbook change
is published and merged. This implementation did not modify Unibase. Check the PR
containing this handoff for publication/merge status; project #2's browser migration is applied.

1. Read Unibase's local authority, source map and existing integration. Refresh Handbook
   using the existing launcher and retain that task revision. Do not silently use this
   unpublished working tree as a committed baseline.
2. Inventory Unibase's actual repository identity and recorded tracking choice. Preserve
   the existing Uniwares project #2 association; do not create a replacement project or
   import a backlog. Reconfirm only if the recorded choice is invalid or the user changes it.
3. Add a consumer-relative `tracking` path to handbook.json and local configuration with
   organization/project identity, explicitly included repositories, field/status mappings
   and a local policy reference. Do not copy Handbook's multi-repository inventory.
4. Reconcile local guidance with the shared default: Backlog, Ready, In progress, In review,
   Done and Cancelled; separate blockers; one accountable human; human acceptance/closure.
   Preserve accepted queues, advisory validation and application-specific facts. Assess
   shared improvements first; record genuine local exceptions and rationale.
5. Run offline structural checks, client-reference sync/drift checks and relevant local
   validation. Inventory/preview are read-only; any writes need exact authorized scope.
   The current CLI lacks Projects scope: report that limit without expanding credentials.
6. Review the diff separately and report actual checks, deferred client runtime checks,
   baseline revision, local exceptions and publication status. Publication/merge require
   session authorization. Do not create demonstration issues or independently close work.

Project #2 now has six statuses, nine views and only added/reopened-to-Backlog workflows.
Closed-to-Done is disabled; verified human completion maps to Done and not-planned closure
to Cancelled. See [verification](verification.md) and [shared operations](project.md).
