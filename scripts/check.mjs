import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { validateTracking } from './tracking-config.mjs';
import { catalogParity, toolNeutral, descriptionBudget, skillShape, alwaysLoaded } from './guidance-lint.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = directory => readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
  assert(!entry.isSymbolicLink(), `Unexpected symlink: ${entry.name}`);
  const name = path.posix.join(directory, entry.name);
  return entry.isDirectory() ? walk(name) : [name];
});
const files = ['README.md', 'AGENTS.md', 'CLAUDE.md', 'PROVENANCE.md', ...walk('docs'), ...walk('.agents'), ...walk('.claude'), ...walk('.github')];
const errors = [];
for (const file of files) {
  const text = readFileSync(path.join(root, file), 'utf8');
  if (file.endsWith('.md')) for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (target && !/^[a-z]+:|^</i.test(target) && !existsSync(path.resolve(root, path.dirname(file), target))) errors.push(`${file}: missing ${target}`);
  }
}
const names = readdirSync(path.join(root, '.agents/skills')).sort();
assert.deepEqual(names, JSON.parse(readFileSync(path.join(root, 'handbook-contract.json'), 'utf8')).skills.sort());
for (const name of names) {
  const text = readFileSync(path.join(root, `.agents/skills/${name}/SKILL.md`), 'utf8').replace(/\r\n/g, '\n');
  assert(text.startsWith('---\n') && text.match(/^name: ["']?([^\r\n"']+)/m)?.[1] === name && /^description: .+/m.test(text) && text.includes('\n---\n'), `Invalid skill frontmatter: ${name}`);
  errors.push(...descriptionBudget(name, text), ...skillShape(name, text, walk(`.agents/skills/${name}`)));
}
const imported = Object.keys(JSON.parse(readFileSync(path.join(root, 'provenance/technology-imports.json'), 'utf8')).skills);
const text = file => readFileSync(path.join(root, file), 'utf8');
for (const file of ['AGENTS.md', 'CLAUDE.md']) errors.push(...alwaysLoaded(file, text(file).replace(/\r\n/g, '\n')));
errors.push(...catalogParity({ skills: names, imported, agents: text('AGENTS.md'), domains: text('docs/guidance/README.md') }));
const canonical = files.filter(file => file.endsWith('.md') && !imported.some(name => file.startsWith(`.agents/skills/${name}/`)));
errors.push(...toolNeutral(Object.fromEntries(canonical.map(file => [file, text(file)]))));
// Forms stay permissive: markdown hints plus optional fields; validate shape, not content.
for (const dir of ['.github/ISSUE_TEMPLATE', '.agents/templates/github/ISSUE_TEMPLATE']) {
  for (const name of ['bug','feature','task','initiative']) {
    const form = JSON.parse(readFileSync(path.join(root, dir, `${name}.yml`), 'utf8'));
    assert(form.name && form.description && ['Task','Bug','Feature'].includes(form.type), `Invalid form: ${dir}/${name}.yml`);
    const ids = form.body.filter(field => field.id).map(field => field.id);
    assert.equal(new Set(ids).size, ids.length, `Duplicate field id: ${dir}/${name}.yml`);
    for (const field of form.body) assert(['markdown','textarea','input','dropdown'].includes(field.type) && (field.type === 'markdown' ? field.attributes?.value : field.id && field.attributes?.label) && (field.validations === undefined || typeof field.validations.required === 'boolean'), `Invalid field in ${dir}/${name}.yml`);
  }
  JSON.parse(readFileSync(path.join(root, dir, 'config.yml'), 'utf8'));
}
const lf = file => text(file).replace(/\r\n/g, '\n');
for (const name of ['bug.yml','feature.yml','task.yml','initiative.yml','config.yml']) assert.equal(lf(`.github/ISSUE_TEMPLATE/${name}`), lf(`.agents/templates/github/ISSUE_TEMPLATE/${name}`), `Handbook issue form ${name} must match its shared starter`);
const config = JSON.parse(readFileSync(path.join(root, 'project.json'), 'utf8'));
validateTracking(config);
const hashes = Object.fromEntries(walk('.agents').sort().map(file => {
  const bytes = readFileSync(path.join(root, file));
  const binary = /\.(png|jpg|jpeg|gif|ico|woff2?|pdf|zip)$/i.test(file) || bytes.includes(0);
  return [file, createHash('sha256').update(binary ? bytes : bytes.toString('utf8').replace(/\r\n/g, '\n')).digest('hex')];
}));
const lock = path.join(root, 'skills-lock.json');
if (process.argv.includes('--write-lock')) writeFileSync(lock, JSON.stringify({ version: 2, hashFormat: 'sha256 LF-normalized text, raw binary', files: hashes }, null, 2) + '\n');
else assert.deepEqual(JSON.parse(readFileSync(lock, 'utf8')).files, hashes, 'Review changes before refreshing skill integrity hashes');
assert.deepEqual(errors, []);
console.log(`Verified ${names.length} skills, local Markdown targets, own and shared JSON-compatible YAML issue forms, skill catalogs, tool-neutral wording, description budgets, skill shape, always-loaded size and integrity hashes.`);
