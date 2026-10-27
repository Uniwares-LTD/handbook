# Provenance and retained notices

Five skills and the implementation/reviewer contracts were adapted from Uniwares-LTD/unibase.
[The import record](provenance/imports.json) retains the exact source revision, prior
source identities, source references and upstream records. It also retains pre-adaptation
file hashes; current files are recorded separately in [skills-lock.json](skills-lock.json).

Imported skill directories retain their bundled UI metadata and the learning template.
No LICENSE or NOTICE files existed in these five selected source directories; no such
files were removed. The source provenance includes karpishe-experiments/agentic-poc
and core-agent-skills v0.4.0. This private adaptation does not assert a new third-party
license. Do not publish these resources publicly without reviewing their source rights.
The manage-issues skill and handbook-specific policy/helpers are newly authored here.

Changes remove application-specific assumptions and align issue updates with member-led
acceptance. Four reusable framework/UI skills are now also imported with their resources
and notices in [the technology import record](provenance/technology-imports.json).
This preserves their original provenance and pre-adaptation hashes; Unibase is unchanged
until the Handbook changes are reviewed and merged. The generic launcher is derived
from Unibase's scripts/handbook.mjs at that recorded revision. System-owned skills
are neither copied nor modified. Refresh current hashes only after reviewing intended
changes: `node scripts/check.mjs --write-lock`, then `npm run validate`.
