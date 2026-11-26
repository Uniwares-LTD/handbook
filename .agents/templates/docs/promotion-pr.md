# Promote SOURCE to TARGET

## Reviewed result

Source full tip: SOURCE_SHA. Target full tip: TARGET_SHA.
Reviewed merge result: RESULT_IDENTITY. Record target-only contributions and any
conflicts; omit an empty promotion. Included source PRs/issues or accepted work:

For a delivery branch, record its reviewed head, the resolved regions and evidence
that target-only changes survive. For rollback, identify the deployed merge,
target-side parent, verified recovery point and compatibility with serving data.

## Action inventory

| Label | Requirement and source | Owner / location | Order / evidence | State / failure or resume |
| --- | --- | --- | --- | --- |
| B1-example | Required prerequisite; source PR or found in diff review | Named owner / execution location | Before activation; exact verified evidence | Pending blocks release |
| A1-example | Compatible optional work | Named owner / execution location | After successful release | Deferred with reason |

Required actions need evidence, not a bare done/skip answer. Preserve labels on updates.
Remove examples and inapplicable sections. Link test flows separately.

## Test flow

Link source PR test flows and exact Release run/candidate verification.

## Operator intervention

State none, or owner, location, reviewed controller/configuration/image/data impact,
publication/installation/release ordering, verification and failure/resume. Record
plan ID/digest, approved batch/backup and original blocked-run continuation when needed.

Related to OWNER/REPOSITORY#ISSUE
