import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { checkReadiness, syncEntrypoints, syncTemplates, mapSections, permissionEntries, gatesFile, branchWarnings } from '../scripts/handbook-integration.mjs';

const source = fileURLToPath(new URL('..', import.meta.url));
const branches = '## Branches\n\n- Integration branch: dev\n- Deployment branches: _staging (from dev), _production (from _staging)\n';
function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'handbook-integration-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const config = { version: 1, kind: 'consumer', guidance: 'docs/local.md', sourceMap: 'docs/architecture.md#source-map', technologySkills: ['playwright'], tracking: 'tracking.json', preferences: '.agents/repository.md' };
  mkdirSync(path.join(root, '.agents'));
  writeFileSync(path.join(root, '.agents/repository.md'), `# Repository preferences\n\n## Work tracking\n\n- Issue language: Persian\n\n${branches}`);
  mkdirSync(path.join(root, 'docs'));
  writeFileSync(path.join(root, 'handbook.json'), JSON.stringify(config));
  writeFileSync(path.join(root, 'tracking.json'), JSON.stringify({ version: 1, provider: 'github', organization: 'example-org', title: 'Delivery', scope: 'organization', number: 3, url: 'https://github.com/orgs/example-org/projects/3', repositories: ['example-org/product'] }));
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
  assert.match(wrapper, /Handbook bootstrap.*handbook.md/);
  assert.match(wrapper, /retained Handbook path and full revision/);
  assert.doesNotMatch(wrapper, /HANDBOOK_SETUP_REQUIRED/);
  // These instructions must be available before the private checkout exists.
  for (const text of [readFileSync(path.join(root, '.agents/handbook.md'), 'utf8')]) {
    assert.match(text, /HANDBOOK_SETUP_REQUIRED/);
    assert.match(text, /ask once for this task/);
    assert.match(text, /explicit setup request already grants approval/);
    assert.match(text, /-- --path set to that destination/);
    assert.match(text, /resume the original task/);
    assert.match(text, /If declined, do not ask again during this task/);
    assert.match(text, /do not repeatedly retry/);
    assert.match(text, /Client permission prompts may still be required/);
  }
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

test('gated commands merge add-only into the local list and Claude settings', t => {
  const root = fixture(t);
  mkdirSync(path.join(root, '.claude'));
  writeFileSync(path.join(root, '.claude/settings.json'), JSON.stringify({ model: 'keep', permissions: { ask: ['Bash(make deploy *)'], allow: ['Bash(npm test)'] } }));
  writeFileSync(path.join(root, gatesFile), JSON.stringify({ ask: [['make', 'deploy'], ['git', 'push']], denyRead: [] }));
  const first = syncEntrypoints(root, { source, write: true });
  assert(first.changed.includes(gatesFile) && first.changed.includes('.claude/settings.json'));
  const gates = JSON.parse(readFileSync(path.join(root, gatesFile), 'utf8'));
  assert.deepEqual(gates.ask.slice(0, 2), [['make', 'deploy'], ['git', 'push']]);
  assert.equal(gates.ask.filter(c => c.join(' ') === 'git push').length, 1);
  const settings = JSON.parse(readFileSync(path.join(root, '.claude/settings.json'), 'utf8'));
  assert.equal(settings.model, 'keep');
  assert.deepEqual(settings.permissions.allow, ['Bash(npm test)']);
  const wanted = permissionEntries(gates);
  assert.equal(settings.permissions.ask[0], 'Bash(make deploy *)');
  assert(wanted.ask.every(e => settings.permissions.ask.includes(e)) && wanted.deny.every(e => settings.permissions.deny.includes(e)));
  assert.deepEqual(syncEntrypoints(root, { source, write: true }).changed, []);
  assert.deepEqual(syncEntrypoints(root, { source }).warnings, []);
  settings.permissions.ask = settings.permissions.ask.filter(e => e !== 'Bash(git push *)');
  writeFileSync(path.join(root, '.claude/settings.json'), JSON.stringify(settings));
  assert.deepEqual(syncEntrypoints(root).warnings, ['.claude/settings.json: 1 gated permission entries missing.']);
  writeFileSync(path.join(root, '.claude/settings.json'), JSON.stringify({ permissions: { ask: 'all' } }));
  assert.match(syncEntrypoints(root, { write: true }).warnings.at(-1), /must be lists; reconcile manually/);
  assert.equal(JSON.parse(readFileSync(path.join(root, '.claude/settings.json'), 'utf8')).permissions.ask, 'all');
});

test('retired shared gates leave consumer lists and Claude settings', t => {
  const root = fixture(t);
  mkdirSync(path.join(root, '.claude'));
  const custom = ['Bash(make deploy *)', 'Bash(git commit --amend *)'];
  writeFileSync(path.join(root, '.claude/settings.json'), JSON.stringify({ permissions: { ask: [...custom, 'Bash(git commit *)', 'PowerShell(git commit)'] } }));
  writeFileSync(path.join(root, gatesFile), JSON.stringify({ ask: [['make', 'deploy'], ['git', 'commit']], denyRead: [] }));
  const result = syncEntrypoints(root, { source, write: true });
  assert(result.changed.includes(gatesFile) && result.changed.includes('.claude/settings.json'));
  const gates = JSON.parse(readFileSync(path.join(root, gatesFile), 'utf8'));
  assert(!gates.ask.some(c => c.join(' ') === 'git commit') && gates.ask.some(c => c.join(' ') === 'make deploy'));
  assert(gates.retired.some(c => c.join(' ') === 'git commit'));
  const ask = JSON.parse(readFileSync(path.join(root, '.claude/settings.json'), 'utf8')).permissions.ask;
  assert(custom.every(e => ask.includes(e)) && !ask.some(e => /\(git commit( \*)?\)$/.test(e)));
  assert(ask.includes('Bash(git push *)'));
  assert.deepEqual(syncEntrypoints(root, { source }).warnings, []);
});

test('sync refuses an empty skill tree instead of reporting every wrapper as orphaned', t => {
  const root = fixture(t);
  assert.throws(() => syncEntrypoints(root), /No skills found under \.agents\/skills/);
  const empty = mkdtempSync(path.join(tmpdir(), 'handbook-empty-source-'));
  t.after(() => rmSync(empty, { recursive: true, force: true }));
  assert.throws(() => syncEntrypoints(root, { source: empty, write: true }), /check --root and --source/);
});

test('issue language preference is required for consumers and limited to English or Persian', t => {
  const root = fixture(t);
  syncEntrypoints(root, { source, write: true });
  const prefs = path.join(root, '.agents/repository.md');
  writeFileSync(prefs, `# Repository preferences\n\n- Issue language: French\n\n${branches}`);
  assert.deepEqual(checkReadiness(root).warnings, ['preferences: Set "- Issue language:" to one of English, Persian.']);
  writeFileSync(prefs, `# Repository preferences\n\n${branches}`);
  assert.deepEqual(checkReadiness(root).warnings, ['preferences: Set "- Issue language:" to one of English, Persian.']);
  const config = JSON.parse(readFileSync(path.join(root, 'handbook.json'), 'utf8'));
  delete config.preferences;
  writeFileSync(path.join(root, 'handbook.json'), JSON.stringify(config));
  assert.match(checkReadiness(root).warnings[0], /record repository preferences, including the issue language/);
});

test('durable branches need main or dev for integration and a promotion chain for deployments', () => {
  const prefs = (integration, deployment) => `- Integration branch: ${integration}\n` + (deployment === undefined ? '' : `- Deployment branches: ${deployment}\n`);
  assert.deepEqual(branchWarnings(prefs('main', 'none')), []);
  assert.deepEqual(branchWarnings(prefs('dev', '_staging (from dev), _production (from _staging)')), []);
  assert.match(branchWarnings(prefs('master', 'none'))[0], /main or dev/);
  assert.match(branchWarnings('')[0], /Integration branch/);
  assert.match(branchWarnings(prefs('main'))[0], /Add "- Deployment branches:"/);
  assert.match(branchWarnings(prefs('main', 'staging (from main)'))[0], /_<environment> \(from <source>\)/);
  assert.match(branchWarnings(prefs('main', '_production (from _staging), _staging (from main)'))[0], /_production must come from main or an earlier/);
  assert.match(branchWarnings(prefs('main', '_staging (from main), _staging (from main)'))[0], /listed twice/);
});

test('consumer without a recorded tracking project is reported, not blocked', t => {
  const root = fixture(t);
  syncEntrypoints(root, { source, write: true });
  const config = JSON.parse(readFileSync(path.join(root, 'handbook.json'), 'utf8'));
  delete config.tracking;
  writeFileSync(path.join(root, 'handbook.json'), JSON.stringify(config));
  const result = checkReadiness(root);
  assert.equal(result.ready, false);
  assert.deepEqual(result.warnings, ['handbook.json: record a tracking project selection (organization-wide by default); see docs/project.md.']);
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

test('starter templates are copied once, never overwritten unless named, and follow handbook.json paths', t => {
  const root = fixture(t);
  const preview = syncTemplates(root, { source });
  assert.deepEqual(preview.changed, []);
  const status = Object.fromEntries(preview.templates.map(item => [item.path, item.status]));
  assert.equal(status['.github/ISSUE_TEMPLATE/bug.yml'], 'missing');
  assert.equal(status['docs/templates/feature-spec.md'], 'missing');
  assert.equal(status['docs/local.md'], 'differs');
  assert.equal(status['.agents/repository.md'], 'differs');
  // An anchored source map is part of a larger document, so it is never copied over.
  assert.deepEqual(preview.skipped.map(item => item.template), ['.agents/templates/docs/source-map.md']);
  mkdirSync(path.join(root, '.github'));
  writeFileSync(path.join(root, '.github/PULL_REQUEST_TEMPLATE.md'), '# Ours\n');
  const first = syncTemplates(root, { source, write: true });
  assert(first.changed.includes('.github/ISSUE_TEMPLATE/bug.yml') && first.changed.includes('docs/templates/how-to.md'));
  assert(!first.changed.includes('docs/local.md') && !first.changed.includes('.github/PULL_REQUEST_TEMPLATE.md'));
  assert.equal(readFileSync(path.join(root, '.github/PULL_REQUEST_TEMPLATE.md'), 'utf8'), '# Ours\n');
  assert.deepEqual(syncTemplates(root, { source, write: true }).changed, []);
  const updated = syncTemplates(root, { source, update: ['./.github/PULL_REQUEST_TEMPLATE.md', 'docs/typo.md'] });
  assert.deepEqual(updated.changed, ['.github/PULL_REQUEST_TEMPLATE.md']);
  assert.deepEqual(updated.warnings, ['--update docs/typo.md: no template targets this path.']);
  assert.match(readFileSync(path.join(root, '.github/PULL_REQUEST_TEMPLATE.md'), 'utf8'), /## Verification/);
  assert.match(readFileSync(path.join(root, 'docs/local.md'), 'utf8'), /^# Local/);
  syncEntrypoints(root, { source, write: true });
  assert.deepEqual(checkReadiness(root), { ready: true, warnings: [] });
  // Entrypoints and escaping paths are skipped with a reason; the other templates still run.
  const config = JSON.parse(readFileSync(path.join(root, 'handbook.json'), 'utf8'));
  writeFileSync(path.join(root, 'handbook.json'), JSON.stringify({ ...config, guidance: 'AGENTS.md', preferences: '../outside.md' }));
  const guarded = syncTemplates(root, { source, write: true, update: ['AGENTS.md'] });
  assert.deepEqual(guarded.skipped.map(item => item.template).sort(), ['.agents/templates/docs/repository-adapter.md', '.agents/templates/docs/repository.md', '.agents/templates/docs/source-map.md']);
  assert(guarded.templates.some(item => item.path === '.github/ISSUE_TEMPLATE/bug.yml'));
  assert.doesNotMatch(readFileSync(path.join(root, 'AGENTS.md'), 'utf8'), /Repository guidance/);
});

function sourceFixture(t) {
  const copy = mkdtempSync(path.join(tmpdir(), 'handbook-source-copy-'));
  t.after(() => rmSync(copy, { recursive: true, force: true }));
  for (const name of ['handbook-contract.json', '.agents/skills', 'docs/consumer-bootstrap.md']) {
    mkdirSync(path.dirname(path.join(copy, name)), { recursive: true });
    cpSync(path.join(source, name), path.join(copy, name), { recursive: true });
  }
  return copy;
}

test('bootstrap-only edits change one guide, preserve suffixes and leave wrappers stable', t => {
  const root = fixture(t), copy = sourceFixture(t);
  syncEntrypoints(root, { source: copy, write: true });
  const guide = path.join(root, '.agents/handbook.md');
  writeFileSync(guide, readFileSync(guide, 'utf8') + '\nLocal suffix.\n');
  const shared = path.join(copy, 'docs/consumer-bootstrap.md');
  writeFileSync(shared, readFileSync(shared, 'utf8') + '\nClarified shared bootstrap.\n');
  assert.deepEqual(syncEntrypoints(root, { source: copy, write: true }).changed, ['.agents/handbook.md']);
  assert(readFileSync(guide, 'utf8').endsWith('\nLocal suffix.\n'));
  assert.deepEqual(syncEntrypoints(root, { source: copy, write: true }).changed, []);
});

test('procedure changes do not churn consumers; metadata edits affect only matching wrappers', t => {
  const root = fixture(t), copy = sourceFixture(t);
  syncEntrypoints(root, { source: copy, write: true });
  const skill = path.join(copy, '.agents/skills/playwright/SKILL.md');
  writeFileSync(skill, readFileSync(skill, 'utf8') + '\nChanged shared procedure.\n');
  assert.deepEqual(syncEntrypoints(root, { source: copy, write: true }).changed, []);
  writeFileSync(skill, readFileSync(skill, 'utf8').replace(/^description: .+$/m, 'description: "Use when testing new discovery metadata."'));
  assert.deepEqual(syncEntrypoints(root, { source: copy, write: true }).changed,
    ['.agents/skills/playwright/SKILL.md', '.claude/skills/playwright/SKILL.md']);
});

test('missing or customized bootstrap is diagnosed without overwriting user content', t => {
  const root = fixture(t);
  syncEntrypoints(root, { source, write: true });
  const guide = path.join(root, '.agents/handbook.md');
  rmSync(guide);
  assert(checkReadiness(root).warnings.some(w => w.includes('Missing .agents/handbook.md')));
  assert(syncEntrypoints(root).warnings.some(w => w.includes('Missing .agents/handbook.md')));
  syncEntrypoints(root, { source, write: true });
  writeFileSync(guide, '# Custom bootstrap\nKeep it.\n');
  const before = readFileSync(guide, 'utf8');
  const result = syncEntrypoints(root, { source, write: true });
  assert(result.warnings.some(w => w.includes('migration deferred')));
  assert(checkReadiness(root).warnings.some(w => w.includes('Customized/unmanaged')));
  assert.equal(readFileSync(guide, 'utf8'), before);
  assert.deepEqual(result.changed, []);
});

test('legacy consumers stay usable and migrate only after an intact bootstrap is available', t => {
  const root = fixture(t);
  syncEntrypoints(root, { source, write: true });
  const skills = path.join(root, '.agents/skills');
  for (const name of ['capture-project-learnings', 'compile-feature-spec', 'manage-issues', 'maintain-docs', 'maintain-project', 'review-change', 'sync-docs-issues', 'work-on-task', 'playwright']) {
    const file = path.join(skills, name, 'SKILL.md');
    const front = readFileSync(file, 'utf8').split('\n---\n')[0] + '\n---\n\n';
    const old = front + 'Run handbook:check and read the shared skill at the retained revision.\n';
    writeFileSync(file, old + '<!-- handbook-managed:' + createHash('sha256').update(old).digest('hex') + ' -->\n');
  }
  rmSync(path.join(root, '.agents/handbook.md'));
  assert.deepEqual(checkReadiness(root).warnings, []);
  assert.deepEqual(syncEntrypoints(root, { write: true }).changed, []);
  writeFileSync(path.join(root, '.agents/handbook.md'), '# Existing customized bootstrap\n');
  assert.deepEqual(syncEntrypoints(root, { source, write: true }).changed, []);
  assert.doesNotMatch(readFileSync(path.join(skills, 'playwright/SKILL.md'), 'utf8'), /Handbook bootstrap/);
  rmSync(path.join(root, '.agents/handbook.md'));
  const migrated = syncEntrypoints(root, { source, write: true });
  assert.equal(migrated.changed[0], '.agents/handbook.md');
  assert.match(readFileSync(path.join(skills, 'playwright/SKILL.md'), 'utf8'), /Handbook bootstrap/);
  assert.deepEqual(checkReadiness(root).warnings, []);
});

test('older snapshots without a bootstrap preserve existing consumer routes', t => {
  const root = fixture(t), copy = sourceFixture(t);
  syncEntrypoints(root, { source, write: true });
  rmSync(path.join(copy, 'docs/consumer-bootstrap.md'));
  const result = syncEntrypoints(root, { source: copy, write: true });
  assert.deepEqual(result.changed, []);
  assert(result.warnings.some(w => w.includes('Source lacks')));
  assert(existsSync(path.join(root, '.agents/handbook.md')));
});

test('empty bootstrap source cannot install dependent wrappers', t => {
  const root = fixture(t), copy = sourceFixture(t);
  writeFileSync(path.join(copy, 'docs/consumer-bootstrap.md'), '  \n');
  const result = syncEntrypoints(root, { source: copy, write: true });
  assert(result.warnings.some(w => w.includes('Empty docs/consumer-bootstrap.md')));
  assert(!existsSync(path.join(root, '.agents/handbook.md')));
  assert(!existsSync(path.join(root, '.agents/skills/playwright/SKILL.md')));
});
