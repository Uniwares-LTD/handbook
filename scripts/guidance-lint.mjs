// Guidance lints used by check.mjs; each returns a list of error strings.
const skillName = /\b[a-z][a-z0-9]*(?:-[a-z0-9]+)+\b/g;
export const descriptionLimit = 1024;
export const toolAuthority = /\b(?:Codex|Claude(?: Code)?) (?:may|must|should|can)\b/;

// Both catalogs must name every skill they cover, and name no skill that does not exist.
export function catalogParity({ skills, imported, agents, domains }) {
  const errors = [], known = new Set(skills);
  const listed = agents.match(/Shared skills are in `\.agents\/skills`:([^.]*)\./)?.[1];
  if (listed === undefined) errors.push('AGENTS.md: missing the "Shared skills are in `.agents/skills`:" list.');
  const cells = domains.split('\n').filter(line => line.startsWith('| [')).map(line => line.split('|')[3] ?? '').join(',');
  // Presence matches exact names (single-word skills included); unknown-name detection
  // uses hyphenated tokens so ordinary prose words are not mistaken for skills.
  const names = (source, name) => new RegExp(`(^|[^a-z0-9-])${name}($|[^a-z0-9-])`).test(source);
  for (const name of skills) {
    if (!names(cells, name)) errors.push(`docs/guidance/README.md: missing skill ${name}.`);
    if (!imported.includes(name) && listed !== undefined && !names(listed, name)) errors.push(`AGENTS.md: missing shared skill ${name}.`);
  }
  for (const name of new Set(cells.match(skillName))) if (!known.has(name)) errors.push(`docs/guidance/README.md: unknown skill ${name}.`);
  for (const name of new Set(listed?.match(skillName))) if (!known.has(name)) errors.push(`AGENTS.md: unknown skill ${name}.`);
  return errors;
}
// Canonical guidance must not grant authority to one client by name.
export function toolNeutral(documents) {
  return Object.entries(documents).flatMap(([file, text]) => {
    const match = text.match(toolAuthority);
    return match ? [`${file}: tool-specific authority wording "${match[0]}"; state the rule for every client.`] : [];
  });
}
export function descriptionBudget(name, text) {
  const raw = text.match(/^description: (.+)$/m)?.[1] ?? '';
  const value = raw.startsWith('"') ? JSON.parse(raw) : raw.replace(/^'|'$/g, '');
  return value.length > descriptionLimit ? [`${name}: description is ${value.length} characters; keep it within ${descriptionLimit}.`] : [];
}
