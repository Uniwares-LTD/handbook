# Local handbook and deliberate adoption

## Clone and refresh

From the directory containing your repository clones:

```powershell
git clone https://github.com/Uniwares-LTD/handbook.git handbook
node ./handbook/scripts/refresh-handbook.mjs --path ./handbook
```

The default path is the current repository when it is handbook; otherwise its sibling
`../handbook`. `--path` or `UNIWARES_HANDBOOK_PATH` overrides discovery. Run the script
from the consumer root when relying on the sibling default. Relative overrides are
resolved against the current directory. No global installation or symlinks are needed.

Refresh checks the origin identity, requires a clean main checkout, fetches main and
fast-forwards only. It records the synchronized commit in Git's private metadata.
It never resets, stashes, switches branches, pushes or discards work. It refuses an
unexpected origin, including a first-use wrong repository.

When dirty, diverged, ahead of origin, on another branch or offline, refresh returns
the last successful baseline and a limitation. Read policy/skills from that exact
commit with `git -C <resolved-path> show <revision>:docs/work-policy.md` (substitute
the helper's returned path/revision). Do not read dirty working files as the fallback.
Relative references in a fallback skill resolve in the same commit via git show.
If no valid synchronized baseline exists, stop policy-dependent work and obtain it;
never manufacture a baseline from an unverified local branch. Changes to the helper
itself require review before executing a locally modified copy.

## Consumer adoption (deferred)

Only handbook is adopted initially. For each future consumer, use a separately
authorized PR to:

1. Inventory AGENTS.md, adapters, existing skills and their provenance. Resolve local
   conflicts explicitly, especially issue authority, closure, and publication rules.
2. Add a handbook path/bootstrap reference to AGENTS.md and retain repository-specific
   architecture, test commands, operational ownership and canonical documentation.
3. Add thin `.agents/skills/<name>/SKILL.md` entrypoints with matching name/description.
   Each instructs the agent to refresh the handbook, then read the corresponding
   `.agents/skills/<name>/SKILL.md` at the returned revision. Preserve existing resource
   licenses/provenance when replacing local copies; update local integrity checks.
4. Adapt the local repository adapter and issue/PR templates. Copy forms from handbook
   deliberately; they do not automatically propagate from this private repository.
5. Validate local discovery, offline baseline reads, links, checks, and authorization
   scenarios. Record the adopted handbook revision and approve the migration.

Do not migrate existing pending doc queues unless separately authorized. Until that
migration occurs, retain their authority and link them explicitly as legacy queues.
No global framework, application, provider or infrastructure policy is extracted here.

## Contribution and refresh trust

Devs propose handbook policy changes by PR; an Admin approves before merge. This is a
procedural requirement, not a protected-branch guarantee on the current plan. Clean
remote main is the synchronized shared baseline. Refresh does not prove that a human
review occurred; maintainers are responsible for the approval procedure.
