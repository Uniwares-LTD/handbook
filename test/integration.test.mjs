import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkReadiness, syncEntrypoints, mapSections } from '../scripts/handbook-integration.mjs';

const source = fileURLToPath(new URL('..', import.meta.url));
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'handbook-integration-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const config = { version: 1, kind: 'consumer', guidance: 'docs/local.md', sourceMap: 'docs/architecture.md#source-map', technologySkills: ['playwright'] };
  mkdirSync(path.join(root, 'docs'));
  writeFileSync(path.join(root, 'handbook.json'), JSON.stringify(config));
  writeFileSync(path.join(root, 'AGENTS.md'), `Run handbook:check. Read ${config.guidance} and ${config.sourceMap}.`);
  writeFileSync(path.join(root, 'docs/local.md'), '# Local\nRead [architecture](architecture.md#source-map).\n');
  writeFileSync(path.join(root, 'docs/architecture.md'), '# Architecture\n\n## Source map\n' + mapSections.map(name => `\n### ${name}\nUnknown; resolve from project evidence.\n`).join(''));
  return root;
}

test('consumer sync is idempotent and offline readiness needs no clone or credentials', t => {
  const root = fixture(t);
  const first = syncEntrypoints(root, { source, write: true });
  assert(first.changed.includes('.agents/skills/maintain-project/SKILL.md'));
  assert(first.changed.includes('.claude/skills/playwright/SKILL.md'));
  assert.deepEqual(syncEntrypoints(root, { source, write: true }).changed, []);
  assert.deepEqual(syncEntrypoints(root, { source }).warnings, []);
  assert.deepEqual(checkReadiness(root), { ready: true, warnings: [] });
  const wrapper = readFileSync(path.join(root, '.agents/skills/playwright/SKILL.md'), 'utf8');
  assert.match(wrapper, /existing Handbook path and full revision/);
  assert.match(wrapper, /resources --revision SHA/);
});

test('readiness reports broken references, absent map sections and invalid metadata', t => {
  const root = fixture(t);
  syncEntrypoints(root, { source, write: true });
  writeFileSync(path.join(root, 'docs/local.md'), '[missing](missing.md)');
  writeFileSync(path.join(root, 'docs/architecture.md'), '## Source map\n### Components\n');
  const result = checkReadiness(root);
  assert(!result.ready);
  assert(result.warnings.some(w => w.includes('Broken reference')));
  assert(result.warnings.some(w => w.includes('Components')));
  assert(result.warnings.some(w => w.includes('Ownership')));
  writeFileSync(path.join(root, 'handbook.json'), '{broken');
  assert.match(checkReadiness(root).warnings[0], /handbook.json/);
});

test('sync preserves custom instruction content and reports manually modified wrappers', t => {
  const root = fixture(t);
  writeFileSync(path.join(root, 'CLAUDE.md'), '# Local Claude\nKeep this.\n');
  syncEntrypoints(root, { source, write: true });
  assert.equal(readFileSync(path.join(root, 'CLAUDE.md'), 'utf8'), '@AGENTS.md\n\n# Local Claude\nKeep this.\n');
  const file = path.join(root, '.claude/skills/playwright/SKILL.md');
  const original = readFileSync(file, 'utf8');
  writeFileSync(file, original.replace('Read and follow', 'Local override: read'));
  const result = syncEntrypoints(root, { write: true });
  assert(result.warnings.some(w => w.includes('Preserved customized')));
  assert.match(readFileSync(file, 'utf8'), /Local override/);
  assert(!result.changed.includes('.claude/skills/playwright/SKILL.md'));
});

test('metadata changes refresh managed references while preserving custom suffixes', t => {
  const root = fixture(t);
  syncEntrypoints(root, { source, write: true });
  const canonical = path.join(root, '.agents/skills/playwright/SKILL.md');
  const claude = path.join(root, '.claude/skills/playwright/SKILL.md');
  writeFileSync(claude, readFileSync(claude, 'utf8') + '\nCustom suffix.\n');
  writeFileSync(canonical, readFileSync(canonical, 'utf8').replace(/^description: .+$/m, 'description: "Changed discovery text"'));
  const before = readFileSync(claude, 'utf8');
  assert(syncEntrypoints(root).warnings.some(w => w.includes('playwright')));
  assert.equal(readFileSync(claude, 'utf8'), before);
  syncEntrypoints(root, { write: true });
  assert.match(readFileSync(claude, 'utf8'), /Changed discovery text/);
  assert(readFileSync(claude, 'utf8').endsWith('Custom suffix.\n'));
});

test('unmanaged consumer skills survive adoption and removed skills are reported', t => {
  const root = fixture(t);
  mkdirSync(path.join(root, '.agents/skills/playwright'), { recursive: true });
  const file = path.join(root, '.agents/skills/playwright/SKILL.md');
  const own = '---\nname: playwright\ndescription: Local browser procedure\n---\nKeep local behavior.\n';
  writeFileSync(file, own);
  const result = syncEntrypoints(root, { source, write: true });
  assert(result.warnings.some(w => w.includes('Preserved customized/unmanaged')));
  assert.equal(readFileSync(file, 'utf8'), own);
  rmSync(file);
  assert(syncEntrypoints(root).warnings.some(w => w.includes('Orphan Claude')));
});

test('copied offline tool works independently of its original source tree', async t => {
  const root = fixture(t);
  syncEntrypoints(root, { source, write: true });
  mkdirSync(path.join(root, 'scripts'));
  cpSync(path.join(source, 'scripts/handbook-integration.mjs'), path.join(root, 'scripts/handbook-integration.mjs'));
  const { pathToFileURL } = await import('node:url');
  const independent = await import(pathToFileURL(path.join(root, 'scripts/handbook-integration.mjs')).href);
  assert(independent.checkReadiness(root).ready);
});
