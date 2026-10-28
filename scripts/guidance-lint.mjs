// Guidance lints used by check.mjs; each returns a list of error strings.
import path from 'node:path';
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
export const bodyLineLimit = 500, alwaysLoadedLines = 200, alwaysLoadedBytes = 32 * 1024;
// Skills stay discoverable and cheap: spec-shaped name, a "when" in the description,
// a body short enough to load whole, and no nested AGENTS.md picked up as instructions.
export function skillShape(name, text, files = []) {
  const errors = [];
  if (name.length > 64 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) errors.push(`${name}: name must be 1-64 lowercase letters, digits and single hyphens.`);
  const raw = text.match(/^description: (.+)$/m)?.[1] ?? '';
  if (!/\bUse (?:when|for|after)\b|\bused when\b/i.test(raw)) errors.push(`${name}: description should say when to use the skill ("Use when ...").`);
  const lines = text.split('\n---\n').slice(1).join('\n---\n').split('\n').length;
  if (lines > bodyLineLimit) errors.push(`${name}: SKILL.md body is ${lines} lines; keep it within ${bodyLineLimit} and move detail to references.`);
  for (const file of files) if (path.posix.basename(file) === 'AGENTS.md') errors.push(`${name}: ${file} would load as agent instructions; remove it or rename it.`);
  return errors;
}
// Always-loaded instructions stay small for every client.
export function alwaysLoaded(file, text) {
  const lines = text.split('\n').length, bytes = Buffer.byteLength(text);
  return lines > alwaysLoadedLines || bytes > alwaysLoadedBytes ? [`${file}: ${lines} lines, ${bytes} bytes; keep always-loaded instructions within ${alwaysLoadedLines} lines and ${alwaysLoadedBytes} bytes.`] : [];
}
