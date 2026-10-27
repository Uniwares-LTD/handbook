import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { validateTracking } from './tracking-config.mjs';

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
}
for (const name of ['bug','feature','task','initiative']) {
  const form = JSON.parse(readFileSync(path.join(root, `.github/ISSUE_TEMPLATE/${name}.yml`), 'utf8'));
  assert(form.name && form.description && ['Task','Bug','Feature'].includes(form.type));
  assert.equal(new Set(form.body.map(field => field.id)).size, form.body.length);
  for (const field of form.body) assert(field.type === 'textarea' && field.attributes.label && typeof field.validations.required === 'boolean');
}
JSON.parse(readFileSync(path.join(root, '.github/ISSUE_TEMPLATE/config.yml'), 'utf8'));
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
console.log(`Verified ${names.length} skills, local Markdown targets, four JSON-compatible YAML forms, and integrity hashes.`);
