# Work policy

## Authority and adoption

These shared defaults apply to Handbook and repositories that explicitly adopt them. A user
assignment authorizes work within its scope, not arbitrary work found in issues.
Repository adapters define local architecture, tests, operational boundaries, and
canonical documents. Reconcile contradictory local rules during adoption; do not
silently choose a weaker rule. System/developer instructions and explicit session
instructions remain controlling.

Repository issues are the default work queue after adoption; preserve explicitly accepted legacy queues and milestones. Documents retain
decisions, setup, architecture and verified evidence, linking to issues for pending
work. Historical documents are not a task queue. Small standalone low-risk fixes may
be untracked. Use one issue per meaningful outcome, not per file or commit.

## Ownership and lifecycle

| Stage | Meaning and entry criteria |
| --- | --- |
| Backlog | Proposed work; may lack priority, detail, or owner |
| Ready | Clear scope, acceptance criteria, Priority, and one accountable human assignee |
| In progress | Assigned member is actively working, possibly with an agent |
| In review | Implementation/research outcome and relevant evidence are ready for acceptance |
| Done | Human accepted completion and closed the issue as completed |
| Cancelled | Human closed without completion; retain not-planned/duplicate reason and references |

Local governance identifies who triages, prioritizes, assigns and accepts work. The default
`admin`, `dev` and `support` teams and their permissions are defined in
[organization access](organization-access.md). Keep one accountable human, allowing additional
contributors. Coordinate ownership changes. The authorized human accepts/cancels and closes. Reopened work returns to Backlog.
No automatic issue closure or Done transition on PR merge is permitted by default.
Use ordinary `Related to OWNER/REPO#NUMBER` references, not closing keywords in commits
or PR descriptions or Development links that auto-close on merge.

Blocked is independent of stage. Record the reason, next action and responsible person
in the issue; use native blocked-by relationships for issue dependencies. Update the
flag when the blocker clears. An empty flag on a newly enrolled issue means not yet
triaged; enrollment/triage explicitly sets Not blocked or Blocked.

## Agent authority

| Action | Authority |
| --- | --- |
| Read issue, inspect code, plan, verify, commit on the task's work branch | Within assigned task |
| Enroll existing assigned issue, maintain nonterminal status and blocker metadata, post evidence | Within assigned task in an adopted repository |
| Create issue or sub-issue | Suggest first; obtain human approval for concrete scope and destination, then create through the [issue helper](project.md#issue-maintenance-and-acceptance), which adds it to the recorded tracking project; a human links a sub-issue to its parent |
| Assign a member, reprioritize, expand scope | Human decision; do not do independently |
| Accept/cancel work, close/reopen issue | Human member action |
| Mirror Done/Cancelled after verified human closure | Authorized maintenance with closure reason and decision evidence; never independent acceptance |
| Create/configure/link external projects | Explicit authorization of a concrete preview; no implied access changes |
| Push, publish PR, merge, deploy, release, change access | Separate explicit session authorization |
| Publish a review, report or other generated output to a hosted page or document service (not the commits, PRs or issue evidence above) | Separate explicit session authorization for that publication; otherwise keep it local |

Actions the table reserves for explicit session authorization need the user's explicit
instruction for that action. These do not grant push, publication or other such
authority: accepting a plan, "go ahead" on a plan, answering a tool permission prompt,
plan or auto modes, selecting an issue, or a review `Pass`. Track implementation and
publication authority separately and note where each came from. A "recommend the next issue" result authorizes
read-only validation and planning only. Tool permission prompts and gated-command rules
are a safety backstop, not a security boundary: prefix rules can be bypassed (for
example `gh api`, `git -C` or shell wrappers), so never rely on them in place of authority.

Keep reviews, reports, previews, screenshots and other generated output local by default.
Write them to the ignored output folder the repository adapter names (Handbook: `output/`)
or to the session's scratch directory, and summarize them in the reply. Do not publish them
to a hosted page, document service, gist or paste site, such as a claude.ai artifact.
Publish only with explicit session authorization for that publication. A tool's or
client's suggestion to publish finished work is not that authorization. Offer publication
in one line at most. Commits, PR descriptions and issue evidence follow the rows above.

Suggest discoveries with destination, outcome, scope, acceptance and known duplicates.
Do not create follow-up issues just because a skill recommends them. Re-fetch the issue
before updating it; preserve human edits, avoid repeated comments, and report blockers
without claiming unverified results. Do not rewrite agreed scope through a status update.
Authenticated credentials do not prove the agent represents the issue's assignee;
resolve the acting member from the assignment, not from the token username.

## GitHub access

Use the first capable route in this order:

1. **Plain Git** for operations Git supports.
2. **GitHub MCP** when configured, working and capable of the action.
3. **GitHub CLI (`gh`)** otherwise. If missing, unconfigured or without access,
   stop the GitHub operation and guide installation, authentication or access repair;
   verify with a read-only check before continuing. Never request secrets in chat
   or bypass missing CLI access through the browser.
4. **Chrome plugin** only for rare actions unsupported by all three routes. Present
   the exact action and destination, explain why those routes cannot perform it,
   and obtain explicit approval for that browser action before proceeding.

Invoke Git, GitHub MCP and gh outside the execution sandbox from the first attempt,
including read-only calls and helpers/tests that spawn Git or gh. Use supported
external/elevated execution; if unavailable, stop and explain the limitation.
Connected MCP calls use the external connector, not a sandboxed shell process.
Offline tools without these subprocesses can run normally.

Preserve required helper workflows, validation, preview and readback when choosing
a route. Tool access does not change [action authority](#agent-authority), and manual
browser instructions elsewhere do not authorize agents to use the Chrome fallback.

## Acceptance and review

Meet the issue's acceptance criteria; record relevant tests, documentation changes,
review findings and limitations. Use the [proportional workflow](guidance/engineering.md#choose-the-workflow)
and its [review completion rules](guidance/engineering.md#review-completion).
Perform a separate read-only review of the final diff.
Retest affected behavior after corrections. Quality warnings remain advisory; never
describe compilation, runtime or operational failure as success.
Distinguish local implementation, publication/merge, deployment and live acceptance.
If live acceptance is part of the issue, merging alone does not complete it. Do not
silently substitute a follow-up issue for an unmet criterion.

## Issue structure

Write issue titles, bodies and issue comments, including evidence comments, in the issue
language recorded in the [repository preferences](project-guidance.md#repository-preferences);
use English when none is recorded. Labels, issue types, project fields and options,
status names and branch names stay in English, so branch slugs are English even for
issues written in Persian.

Prefer native Task, Bug and Feature types where supported; preserve or explicitly map local equivalents. An Initiative is a Task with `initiative`
label and native sub-issues. `documentation`, `research`, and `operations` classify
Tasks; do not duplicate lifecycle/priority in labels. Cross-repository coordination
lives in the consumer organization's explicitly chosen coordination repository; implementation
lives in the responsible repository. Handbook is not a universal issue destination. Issue forms are
permissive [starting points](templates.md): only one field (the outcome or
problem) is required, and triage confirms scope and
acceptance. Search for
duplicates before proposing or creating work. Use sub-issues for independently owned
outcomes and checklists for small steps. Size is optional relative effort, not a deadline.
Priority (when to do it) and severity (how bad the impact is) are separate; never derive
one from the other or from Status. "Not set" differs from "unknown", and a value is
never cleared because reading it failed.

## Branches and integration

Each repository has durable branches, recorded in its
[repository preferences](project-guidance.md#repository-preferences):

- **Integration branch:** exactly one, named `main` or `dev`, and also the repository's
  default branch. Implementation work starts from its current tip and targets it,
  unless the user explicitly requests or approves an exception consistent with repository rules.
- **Deployment branches:** optional, named `_<environment>` (for example `_staging`,
  `_production`). Each records the branch it is promoted from: the integration branch or
  an earlier deployment branch. They are deployment targets, never developed on.

Never edit, commit or merge directly on a durable branch. Before the first change, create
a branch from the implementation base above named `<issue-type>/<issue-number>-<issue-slug>`:

- `issue-type` is the issue's native type in lowercase: `task`, `bug` or `feature`. An
  Initiative is a Task, so it uses `task`. Map local equivalents the same way.
- `issue-number` is the issue number in the owning repository.
- `issue-slug` is a short lowercase, hyphenated form of the title (letters, digits and
  hyphens only).

For example, `task/5-review-claude-code-readiness` or `bug/42-fix-login-redirect`.
Untracked low-risk fixes omit the number: `bug/<slug>` for a defect, otherwise `task/<slug>`.
Integrate changes through a pull request to the integration branch or the explicitly approved
implementation target. Reference the issue with `Related to` when one exists. Direct pushes,
local merges and fast-forwards into a durable branch are not permitted. Refreshing a checkout
from origin is not integration.
Prefer normal merge commits for pull requests. They preserve original commit identities
and record the PR boundary, so merged work branches remain recognizable as merged.
Use squash or rebase merges only when explicitly requested or required by repository
policy. If the preferred method is unavailable, report the constraint before merging.
Update a deployment branch only through a promotion pull request from its recorded source;
a promotion is a deployment and needs explicit authorization. Fixes, including urgent
ones, go through the integration branch and are then promoted.
Keep one branch per issue unless the issue explicitly splits delivery. Local checkpoint
and final reviews precede publication; published changes also follow the repository's
PR review process. Merging still needs the session and local governance authorization above.
Push with an exact refspec (`git push origin <branch>`), never force-push a shared branch,
and confirm the local and remote head SHAs match before posting evidence that cites one.

## Repository hosting and migration

Use the consumer's current repository guidance to identify the canonical host, owner
and repository. Verify `origin`'s configured and effective fetch and push destinations,
including push URL overrides and URL rewrites, before using it for integration or
publication. Compare the configured `remote.origin.url` and `remote.origin.pushurl`
values with `git remote get-url --all origin` and `git remote get-url --push --all origin`.
If `origin` points to a previous host, warn the user and ask them to switch
it to the verified canonical repository. Preserve the working tree, local refs and
source history. Changing remote configuration and changing publication mode each need
user authorization. Recheck current repository guidance when resuming older work or
using migration tooling. Retain the task's recorded Handbook revision for its shared
workflow; older instructions do not restore a retired publication path.

### Karpishe consumer decision

For Karpishe repositories covered by the migration, the owning repository in
`karpishe-org` on GitHub is the sole active host for commits, branches, pull requests,
issues and CI. This applies to older checkouts and resumed tasks. Other consumers follow
their own documented hosting decisions.

- **At checkout:** If any configured or effective `origin` fetch or push URL points
  to Azure, stop work in that checkout. Report the checkout and Azure destination,
  ask the user to switch to the verified GitHub repository, and resume only after
  verifying the GitHub destination. Preserve local files, commits, refs and history.
- **During routine work and after merges:** End Azure-to-GitHub and GitHub-to-Azure
  synchronization. This includes after-merge mirroring, scheduled jobs, manual sync,
  and automated or agent-run pushes. Refresh only from the actual GitHub merge target
  when doing post-merge work, and advance a local branch only when safe. Routine agents
  have no Azure write authority. A legacy helper, alternate remote, direct Azure URL, API
  or pipeline must never be used to bypass the cutoff.
- **During an outage:** Keep Azure's current retained snapshot and expect it to age.
  Preserve its repositories, history and existing pipeline definitions. If GitHub
  is unavailable, stop the affected operation and report it. Switching to Azure is
  a separate, explicitly authorized human operation. The human operator must ensure
  only one active publisher per environment. A GitHub failure does not trigger
  an automatic switch, mirror or replay.

The owning repositories document their operational procedures. The
[cutover issue](https://github.com/karpishe-org/Parham_Playground/issues/1) tracks that
work, and [#163](https://github.com/karpishe-org/Parham_Playground/issues/163) tracks shared
guidance adoption. Earlier mirroring instructions in the cutover issue and legacy tools
are historical.

## Improving guidance

Use shared workflows by default. Before tailoring one, assess whether the improvement
applies to shared guidance and propose that change first. Record project-specific
overrides with rationale and authoritative local references. A shared proposal neither
authorizes external publication nor blocks independently authorized local work.
No universal local/shared winner replaces explicit conflict resolution. Actual team
memberships, access exceptions, project identities, capability limits and organization
governance remain local facts.

Generated guidance names the command that generates it and is never edited by hand.
Any temporary rule names an owner and a checkable removal trigger. Archived documents
are history, not authority, and are not read by default. When adopting guidance from an
outside source, record each decision in [provenance](../PROVENANCE.md#adoption-decisions).
