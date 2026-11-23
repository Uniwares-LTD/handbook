---
name: operate-data
description: Use when reporting, preparing or inspecting one configured backup or migration through existing approved clients, including uncertain-operation recovery.
---

# Operate Data

Follow [bootstrap](../../../docs/bootstrap.md) and [work policy](../../../docs/work-policy.md).
Read only the consumer's data-operation/deployment runbook and Infrastructure's relevant
backup, approved-plan and recovery sections. Resolve configured target, database,
image, source/configuration identities and owner boundaries from those sources.
No credentials, host names or migration IDs are supplied by this shared skill.
Local readiness is not installed capability or accepted recovery evidence.

## Report and prepare

Use the supported `deploy:ops migrations TARGET [--image IMMUTABLE_IMAGE --commit SHA]`
read-only report or the consumer `data-operations.yml` action `report`. Report full
ledger, disabled owners, pending/changed/unknown IDs, classifications, host recovery
blocks, activation decision and one next action. Follow detail paging; never truncate
an approval batch. Reporting must not execute candidate code, migration bodies,
verifiers, leases or indexes before approval.

`deploy:ops migrate TARGET --image IMMUTABLE_IMAGE --commit SHA` prepares only.
Use `--request-id UUID` for a known preparation retry; preserve the generated request
identity before transport. Same identity/different inputs is rejected. Use a fresh
request for a newly requested backup or remaining batch. Manual actions are `report`,
`prepare-backup`, `prepare-migration`, `status` in the same workflow; there is no CLI
apply shortcut, second approval engine or arbitrary SSH sequence.

Zero pending work does not bypass recovery blocks. A no-work report creates no plan
or backup. Changed checksums, unknown history, missing verifier/classification or
bespoke work need owner review, never force flags or ledger edits.

## Exact approval and execution

Present the concrete plan ID/digest, target/database, exact source/image/configuration,
full-ledger digest, complete ordered batch and backup policy. Reuse consent only for
that exact known action. Planning consent is not execution approval, and optional
work remains optional. The promotion PR body, when present, remains the one action
inventory; do not create a second mandatory checklist/comment.

Apply only through Infrastructure's existing enrolled-actor/OIDC Apply deployment
plan workflow with project/environment/plan ID/digest. The installed executor holds
application lock then one renewable migration lease across verified backup and apply.
It stops recorded writers, retrieves/hashes the exact encrypted archive, persists
backup and write intent, acknowledges the private runner, verifies data/index/ledger,
restores the writer set and checks health. Required `skip` is never success.
A decline, deferral or manual choice performs no mutation.

## Readback, recovery and continuation

Use `deploy:ops status TARGET --plan-id DIGEST` and its paging after interruption,
failed verification or lost response; do not blindly repeat apply or create a fresh
backup to conceal uncertainty. The host journal is authoritative. A missing MongoDB
report copy cannot erase verified host completion; a completed-looking copy cannot
clear failed/unknown host evidence. Image rollback never restores data.

Uncertain writes or unsafe writer/health recovery block new work and activation.
With separately authorized root recovery, use the installed
`data-operation-resolution.py --project ... --environment ... --plan-id ... --inspect`.
Perform only separately authorized manual recovery. Repeat inspection, then record
its exact state hash with `--record --expected-state-hash ... --disposition ...
--operator ... --reason ...`. This utility does not migrate, restore or restart.
The operator explicitly attests the safe serving baseline for unrecorded partial work.
`safe-to-retry` permits a fresh approved remaining batch; it does not complete the
old batch. If all IDs were written, require `verified-complete` with original-image
verifiers, backup, process/lease, writer and health proof. Missing evidence blocks.
The root-only atomic record binds original plan/journal and inspected state; identical
acknowledgments read back, conflicting replacements fail, and resolved plans cannot
be reapplied. Preserve the original failed/unknown outcome.

After required verification, the promotion skill continues the original blocked run
with the same immutable candidate. Optional compatible work can remain deferred.
Report separate operation, migration and deployment outcomes, backup verification,
last observation time, exact workflow/status links and next action. Admin/diagnostic
views are last recorded evidence, never live progress derived from age.

## Workflow contract

Trigger: Configured backup/migration reporting or one explicitly authorized data operation.
Inputs and sources: Consumer runbooks, exact candidate/target, complete ledger/batch,
immutable plan, approval, host checkpoints and recovery acceptance.
Permitted actions and completion: Read-only reporting and preparation; approved fixed
execution only with authority. Verify terminal evidence or report unknown/blockers.
Install no controllers/hooks/privileges, change no trust/provider membership, never
close issues, and keep installation, publication and live acceptance separate.
