---
name: promote-to-environment
description: Use when reviewing or promoting an exact environment merge result and confirming the original release run, including continuation after approved data work.
---

# Promote to Environment

Follow [bootstrap](../../../docs/bootstrap.md) and [work policy](../../../docs/work-policy.md).
Read the consumer's deployment guide, adapter and recorded branch preferences. This
skill grants no publication, merge, deployment, data, controller or permission authority.
Use the repository's accepted promotion starter; otherwise use the
[shared starter](../../templates/docs/promotion-pr.md).

## Review the concrete promotion

Resolve the source and environment target from preferences. Record their full tips,
intended merge result and included source PRs/issues (accepted work may lack an issue).
Review the merge result against the target tip, including target-only commits: a
plain source/target diff can misrepresent them as reversals. Stop on conflicts or
an empty promotion by default. For a conflict, use the delivery branch procedure
below only when the consumer has adopted it and the action is authorized. Use one
promotion PR with a merge commit. Before an authorized merge, recheck both tips and pin the exact reviewed
head. Changed tips or requirements require renewed review of the resulting change.

Read source PR action blocks, then inspect the diff for omitted migrations, indexes,
configuration, workflow, controller and compatibility effects. Use one PR-body action
inventory: `B<number>-<slug>` before release and `A<number>-<slug>` after release.
For each action record source PR (or `found in diff review`), owner/location, ordering,
evidence and failure/resume. Link Test flow separately. Never treat `done` as proof;
verify required evidence. `skip`/defer applies only to advisory or compatible optional
work with a reason. A skipped prerequisite blocks activation.

Before the deployment mutation, present the reviewed requirements and obtain exact
session authorization unless already granted for the same action. Preparation and
review alone do not authorize publishing or merging the promotion.

## Delivery branch and rollback

For an authorized conflict resolution, record the source and target tips and create
a work branch from the target. Merge the recorded source into that work branch.
Resolve only reviewed conflict regions and verify the resulting tree against the
target, including its unrelated changes. Review that result before opening a PR to
the target. Before merge, confirm the original source tip, target tip and reviewed
delivery head. If either original tip moved, rebuild the proposal from current
tips and repeat review. Preserve earlier work during recovery.

For a rollback under the consumer's documented procedure, obtain authority for the
specific release and target. Identify the deployed merge and its original release
run. Verify the pre-release revision and a usable recovery point. Prepare a revert
of that merge on a branch from the current target using the target-side parent and
review the resulting tree for later changes and data compatibility. Use a PR and
the same exact release verification. Route any data recovery through operate-data
under separate exact authority. Pause when a code revert cannot safely serve the
observed data state.

## Verify the actual release

The environment merge creates a new SHA. Never claim its image digest or data plan
was known before that merge. Observe the exact Release run for that SHA and target;
build/publish once, retain its immutable candidate, then read its exact-candidate
report and allowlisted outputs/artifact. Confirm the run identity, environment,
source/image and deployment outcome; a green job or another run is not confirmation.

For `blocked-migrations`, review the prepared plan/digest and use operate-data to
obtain exact execution approval through the existing enrolled-actor/OIDC Apply plan
workflow. After verified data completion, rerun the original blocked Release and
restore the same candidate digest/SHA. Recheck the gates. Initial deployment consent
covers this known-blocked continuation. Missing artifacts, moved reviewed state,
unrelated failed/unknown releases or changed requirements require readback/review;
never silently rebuild or approve a replacement candidate.

A successful compatible release with pending optional work offers one choice:
approve one automated backup/migration now, or use the same manual workflows.
Deferral performs no writes and leaves pending work visible. Prepare any post-release
plan against the observed serving revision before requesting exact execution approval.
Make no migration offer after failed deployment or when nothing is pending.

## Workflow contract

Trigger: Reviewing or executing an authorized environment promotion.
Inputs and sources: Consumer preferences, exact source/target tips, merge-result diff,
source PR action inventory, deployment run and immutable candidate/data reports.
Permitted actions and completion: Local review/preparation; publication and mutations
only with session authority. Report exact run, separate deployment/migration outcomes,
verified actions, optional deferrals and remaining installation/live gates. Never close
issues or equate publication, installation, release and live acceptance.
