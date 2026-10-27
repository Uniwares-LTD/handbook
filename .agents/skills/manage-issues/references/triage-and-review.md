# Triage, selection and board review

These procedures are read-only until the user approves specific writes. Closure,
priority and assignment stay human decisions under the work policy.

## Triage an existing issue

Re-fetch the issue, then pick exactly one decision, checking in this order:

| Decision | Use when | Not sufficient |
| --- | --- | --- |
| Out of scope | The request is outside the repository's responsibility | Being hard or unpopular |
| Obsolete | The affected behavior or area no longer exists | Old age alone |
| Likely resolved | Current code or a merged change addresses the acceptance | A related change that may help |
| Duplicate / overlap | Duplicate only when another issue has the same acceptance boundary; otherwise overlap, linked | Similar titles |
| Invalid | Evidence shows expected behavior or a wrong premise | Failing to reproduce |
| Needs details | A missing fact blocks a decision; ask for that fact | General vagueness without naming the gap |
| Valid | Scope and acceptance are actionable | — |

Label every claim Confirmed, Inferred or Unknown and give High, Medium or Low confidence.
Bound related-work search to about four queries, ten candidates and three deep reads; say
when the bound limited the result. Record which revision of the repository you checked.

## Recommend the next issue

Filter by Status first (normally Ready, unassigned or assigned to the requester). Rank by
Priority, then impact, then smaller effort within the same priority, then assignment.
Effort never lifts an issue above a higher priority. Return a short table (number,
title, priority, why) of four to seven rows and fetch details only for the top choices.
The result authorizes read-only validation and planning only.

## Review the board

1. Fetch every item and compare the count with the project's total; stop if they differ.
2. Take one UTC snapshot time and compute every age from it.
3. Report in fixed sections, writing "None identified." when a section is empty:
   stale (no relevant activity in seven days), blocked without a reason or next action,
   Ready without Priority or an accountable human, In review without acceptance evidence,
   and closed items whose Status disagrees with the closure reason.
4. Propose fixes as a batch for approval; re-fetch each item before writing.
5. Put a stable HTML marker in agent comments (for example `<!-- board-review -->`) and
   update an existing marked comment instead of posting a duplicate.

Classify delivery only from explicit links (closing PR, `Related to` reference); otherwise
report Unknown rather than reconstructing it from commits.
