# Maintainable adoption implementation plan

## Contract and decisions

Implement [requirements](prd.md). The accepted plan authorizes local implementation;
issue creation was explicitly waived; publication and merge remain separate. Use the existing version-1
metadata and commands. Generate `.agents/handbook.md` from one shared source and
reuse managed hashes/custom suffix protection. Keep legacy consumers usable.

## Audit ownership and consolidation decisions

| Surface | Canonical owner and decision | Retained reminder / scenarios |
| --- | --- | --- |
| Consumer skill setup paragraphs | Generated local bootstrap, sourced from docs/consumer-bootstrap.md | Wrapper retains revision and exact shared path; missing/offline setup |
| README / onboarding / bootstrap | README routes; onboarding owns installation; bootstrap owns task context | Root keeps task-start and authority; recovery/handoff |
| Work policy / project / task domain | Policy owns authority; project owns API procedures; domain routes | Permission and uncertain-write reminders at action sites; issue/publication |
| Workflow skills / implementation and review roles | Skills own triggers and outcomes; roles own execution/review procedure | Scope, read-only review and explicit external authority stay visible |
| Next.js / React performance | Next owns API/correctness; React owns measured performance | Installed docs, authorization/cache isolation, CSP/local contracts |
| UI review | One fetch/read/review sequence, scoped to relevant UI | Untrusted remote content and fetch-failure disclosure |
| Playwright | One prerequisite/command route per shell; retain examples and reference resources | Fresh snapshots, scoped captures and headless local preference |
| Practice skills | Preserve unique diagnosis/interview/clarity/minimal-change methods | No inferred delegation or permission from skill wording |
| Templates / catalogs / imports | Templates remain consumer-owned; preserve catalog and provenance checks | No bulk overwrite, new skills or license removal |
| Detailed technology references | Inspect all resources for duplicated governance and conflicting routes; retain technical content unless a specific defect is verified | No speculative API updates |

## Execution prerequisites

Run checks outside sandbox when they spawn Git. The user explicitly waived issue
creation for this task; the accepted plan is the implementation contract.
Codex executable is present; Claude was not found on PATH. Neither is evidence of
fresh-session acceptance. The user authorized fresh Codex CLI test sessions in disposable fixtures, limited to
read-only inspection and local checks. Claude acceptance is by review, not runtime testing.

## Checkpoints

1. Contract and inventory (R1-R5): persist scope, sources, audit decisions and issue
   decision (user waived issue creation); review twice for authority, migration gates and ownership completeness.
2. Tooling (R1-R3): generate protected bootstrap before slim wrappers; diagnose missing
   or customized guides; regression tests for legacy/custom/mixed state and churn.
3. Guidance (R4): audit every skill and resource; consolidate demonstrable duplication,
   preserve actionable reminders and examples; update routing and provenance.
4. Verification (R5): full validate, structural A/A then A/B scenario checks, two final
   integrated reviews; actual client comparisons and fresh-session acceptance remain
   required. Migrate Unibase only after Codex runtime checks and Claude review pass and merged publication.

Each checkpoint requires two consecutive clean read-only passes. Same-agent passes
are disclosed; source changes invalidate affected evidence. Continue automatically
through local preparation; client checks and publication/merge are explicit gates.

## Verified progress and resume

- Checkpoint 1: accepted contract, inventory and ownership decisions reviewed twice
  read-only by the same agent. User waived issue creation; no external writes.
- Checkpoint 2: 19 integration tests pass, including migration protection and update
  isolation. Review corrected empty bootstrap handling; two subsequent same-agent
  read-only passes found no blocking tooling defects.
- Checkpoint 3: all 16 skill entrypoints and shared workflow/adoption docs inspected;
  149 Markdown documents/references scanned for duplicated paragraphs. Detailed
  technical resources retained except the verified contradictory Map/Set example.
  This is a maintainability audit, not a full framework/API recertification. Two
  same-agent read-only passes found no remaining blocking guidance defects.
- Full `npm run validate`: 74 tests passed, integrity/catalog/link checks passed;
  readiness and entrypoint drift reported no warnings. Claude static review passed
  for all 12 selected fixture wrappers; runtime testing was waived by the user.
- Codex CLI 0.162.0-alpha.17.2: two fresh baseline sessions (A/A), followed by
  one candidate session (A/B), completed the fixed ten-scenario probe. All three
  discovered 12 native skills, read consumer guidance/preferences/tracking and
  immutable skill/resources, retained their full revision in handoffs, and made no
  writes or external calls. No observed new hard failures or unnecessary questions.
  Each used six inspection commands. The baseline runs recovered from shell/path
  lookup errors; the candidate had no nonzero command exits. This small sample
  establishes observed instruction-following, not universal reliability or lower cost.
- A separate fresh candidate Codex session using automatic permission review passed
  the exact cached check, doctor, resources, readiness and entrypoint commands (all
  exit 0), then read Playwright and its snapshot wrapper. Earlier startup attempts
  hit blocked npm.ps1 and the unconfigured default path; explicit retained-path
  checks succeeded without cloning. Read-only comparison sessions correctly disclosed
  that outside-sandbox Git checks were unavailable. No tracked fixture files changed.
- Native tests used synthetic committed sources and pre-materialized snapshots.
  Actual refresh A-to-B, dirty/offline preservation and handoff/resource retention are
  covered by disposable automated fixtures; native scenario answers are not claims
  of live app, UI, provider or production acceptance. Claude acceptance is static
  review only, as explicitly requested. An interrupted pilot with unresolved fixture
  paths was excluded before both baseline comparison runs.
- Consumer footprint: 12 wrappers decreased from 326 lines / 24,307 UTF-8 bytes to
  122 lines / 8,467 bytes; including the new bootstrap, 172 lines / 11,550 bytes.
  This is a maintenance measurement, not a model-token or performance improvement claim.
- Raw local traces/prompts and fixture identities remain in ignored
  output/adoption-acceptance. Reviewed behavior scenarios are in
  [acceptance scenarios](acceptance-scenarios.md). Native tested guidance/tooling
  source digest (LF-normalized text, sorted paths and NUL delimiters):
  `a64feed0aa95f9bb92e132e388da7b11039409b14afcf68abac535a3c11e5aa1`. Planning/evidence docs are excluded from this digest.
- Final integrated review: two consecutive same-agent read-only passes on the
  tested source state found no confirmed blocking findings. Pass one checked
  generation, migration safety and regression boundaries; pass two checked the
  complete guidance changes, authority, acceptance evidence and consumer isolation.
  These are cold-review fallback passes, not independent-agent review.
- Publication and merge were explicitly authorized by the user after local acceptance,
  conditional on no blocking review findings. The publication review confirmed the
  remote base remains unchanged. Only after merge, migrate Unibase from the merged
  committed snapshot and run its affected checks. No deployment is part of this work;
  the PR records publication and merge outcomes.

## Skill audit disposition

| Skills | Decision |
| --- | --- |
| maintain-project, maintain-docs | Retain ownership/adoption and template protections; no redundant rewrite |
| compile-feature-spec, work-on-task, review-change | Direct engineering routing; preserve proportional stages, role contracts and review criteria |
| sync-docs-issues, capture-project-learnings | Direct engineering routing; preserve nearest-source updates and evidence boundaries |
| manage-issues | Direct task-domain routing; consolidate repeated intake reminders, retain helper/readback and human-acceptance safeguards |
| next-best-practices, vercel-react-best-practices | Shared technology completion contract; preserve separate correctness/performance indexes and examples |
| playwright, web-design-guidelines | Shared technology contract; remove duplicate review sequence and align headless guidance |
| grilling, diagnosing-bugs, ponytail, asd-ste100 | Retain distinct practice methods/resources; add brief local-authority boundary and constrain delegated lookup |

Unchanged policy/operations/template documents retain their canonical ownership.
No new skills, external project defaults, client hooks or runtime dependencies were added.
