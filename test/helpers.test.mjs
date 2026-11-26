import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, readdirSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { refresh, diagnose, intervalMs, coreSkills } from '../scripts/refresh-handbook.mjs';
import { runHandbook, materialize } from '../scripts/handbook.mjs';
import { reconcile } from '../scripts/enroll.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'handbook-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const remote = path.join(root, 'remote.git'), seed = path.join(root, 'seed'), clone = path.join(root, 'handbook');
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }).trim();
  git(root, 'init', '--bare', remote);
  git(remote, 'symbolic-ref', 'HEAD', 'refs/heads/main');
  git(root, 'clone', remote, seed);
  git(seed, 'config', 'user.name', 'Fixture'); git(seed, 'config', 'user.email', 'fixture@example.invalid');
  mkdirSync(path.join(seed, 'docs'));
  for (const file of ['work-policy.md', 'project.md', 'onboarding.md']) writeFileSync(path.join(seed, 'docs', file), '# Guidance\n');
  mkdirSync(path.join(seed, 'scripts'));
  writeFileSync(path.join(seed, 'scripts/refresh-handbook.mjs'), readFileSync(new URL('../scripts/refresh-handbook.mjs', import.meta.url)));
  for (const name of coreSkills) {
    mkdirSync(path.join(seed, '.agents/skills', name), { recursive: true });
    writeFileSync(path.join(seed, '.agents/skills', name, 'SKILL.md'), `---\nname: ${name}\ndescription: Fixture ${name}\n---\n`);
  }
  writeFileSync(path.join(seed, 'policy.md'), 'one'); git(seed, 'add', '.'); git(seed, 'commit', '-m', 'fixture'); git(seed, 'branch', '-M', 'main'); git(seed, 'push', 'origin', 'main');
  git(root, 'clone', remote, clone);
  return { root, remote, seed, clone, git, run: (options = {}) => refresh(clone, { origin: remote, force: true, ...options }) };
}
test('clean refresh fast-forwards and records the exact remote baseline', t => {
  const f = fixture(t); const first = f.run();
  writeFileSync(path.join(f.seed, 'policy.md'), 'two'); f.git(f.seed,'commit','-am','update'); f.git(f.seed,'push','origin','main');
  const next = f.run(); assert(next.fresh); assert.notEqual(first.revision, next.revision);
  assert.equal(next.revision, f.git(f.seed,'rev-parse','HEAD'));
  // The check output itself names the start reads, at the retained revision.
  assert.deepEqual(next.mustRead.map(command => command.at(-1)),
    ['docs/bootstrap.md', 'docs/guidance/communication.md'].map(file => `${next.revision}:${file}`));
  assert.match(next.next, /load the skill for the request in this session/);
});
test('dirty checkout is preserved and fallback points to immutable baseline', t => {
  const f = fixture(t); const baseline = f.run();
  writeFileSync(path.join(f.clone, 'policy.md'), 'local work');
  const result = f.run(); assert(!result.fresh); assert.equal(result.revision, baseline.revision);
  assert.equal(readFileSync(path.join(f.clone,'policy.md'),'utf8'),'local work');
  assert.equal(f.git(f.clone,'show',`${result.revision}:policy.md`),'one');
});
test('missing baseline blocks unsafe first use; unexpected remote is rejected', t => {
  const f = fixture(t); writeFileSync(path.join(f.clone,'policy.md'),'dirty');
  assert.throws(f.run,/no synchronized baseline/);
  assert.throws(() => refresh(f.clone),/Unexpected handbook origin/);
});
test('offline fallback keeps last successful baseline', t => {
  const f = fixture(t); const baseline = f.run();
  // Keep the configured origin identity but make its source unavailable.
  f.git(f.root,'config','--file',path.join(f.remote,'config'),'receive.denyCurrentBranch','ignore');
  rmSync(f.remote,{recursive:true,force:true});
  const result = f.run(); assert(!result.fresh); assert.equal(result.revision,baseline.revision);
});
test('ahead/diverged main and another branch are preserved', t => {
  const f = fixture(t); const baseline = f.run();
  f.git(f.clone,'config','user.name','Fixture'); f.git(f.clone,'config','user.email','fixture@example.invalid');
  writeFileSync(path.join(f.clone,'policy.md'),'local'); f.git(f.clone,'commit','-am','local');
  const head = f.git(f.clone,'rev-parse','HEAD');
  assert.equal(f.run().revision,baseline.revision); assert.equal(f.git(f.clone,'rev-parse','HEAD'),head);
  writeFileSync(path.join(f.seed,'policy.md'),'remote'); f.git(f.seed,'commit','-am','remote'); f.git(f.seed,'push','origin','main');
  assert(!f.run().fresh); assert.equal(f.git(f.clone,'rev-parse','HEAD'),head);
  f.git(f.clone,'checkout','-b','work'); assert(!f.run().fresh); assert.equal(f.git(f.clone,'branch','--show-current'),'work');
});
test('four-hour cache skips fetch, expiry updates and force bypasses the interval', t => {
  const f = fixture(t), now = Date.now(), first = f.run({ now });
  writeFileSync(path.join(f.seed, 'policy.md'), 'new'); f.git(f.seed, 'commit', '-am', 'new'); f.git(f.seed, 'push', 'origin', 'main');
  assert.equal(f.run({ now: now + intervalMs - 1, force: false }).revision, first.revision);
  const next = f.run({ now: now + intervalMs, force: false });
  assert.notEqual(next.revision, first.revision);
  assert.equal(f.run({ now: now + intervalMs + 1 }).mode, 'updated');
});
test('offline retries cool down while immutable cache and doctor remain usable', t => {
  const f = fixture(t), now = Date.now(), first = f.run({ now });
  rmSync(f.remote, { recursive: true, force: true });
  const failed = f.run({ force: false, now: now + intervalMs });
  assert.match(failed.limitation, /Could not fetch/);
  const metadata = f.git(f.clone, 'rev-parse', '--absolute-git-dir');
  const attempt = path.join(metadata, 'uniwares-handbook-attempt.json');
  const before = readFileSync(attempt, 'utf8');
  assert.equal(f.run({ force: false, now: now + intervalMs + 1000 }).revision, first.revision);
  assert.equal(readFileSync(attempt, 'utf8'), before);
  assert.equal(diagnose(f.clone, { origin: f.remote }).revision, first.revision);
  assert.equal(readFileSync(attempt, 'utf8'), before);
  f.run({ now: now + intervalMs + 2000 });
  assert.notEqual(readFileSync(attempt, 'utf8'), before);
});
test('simultaneous checks preserve valid metadata and task baseline', async t => {
  const f = fixture(t), first = f.run();
  const helper = new URL('../scripts/refresh-handbook.mjs', import.meta.url).href;
  const code = `import {refresh} from ${JSON.stringify(helper)}; console.log(JSON.stringify(refresh(${JSON.stringify(f.clone)}, {origin:${JSON.stringify(f.remote)},force:true})));`;
  const run = () => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', code], { windowsHide: true });
    let out = '', err = ''; child.stdout.on('data', data => out += data); child.stderr.on('data', data => err += data);
    child.on('error', reject); child.on('close', status => status === 0 ? resolve(JSON.parse(out)) : reject(new Error(err)));
  });
  const results = await Promise.all([run(), run()]);
  assert(results.every(item => item.revision === first.revision));
  const metadata = f.git(f.clone, 'rev-parse', '--absolute-git-dir');
  assert.equal(JSON.parse(readFileSync(path.join(metadata, 'uniwares-handbook-baseline.json'))).revision, first.revision);
  assert(!readdirSync(metadata).some(name => name.endsWith('.tmp') || name === 'uniwares-handbook-refresh.lock'));
});

test('incompatible candidate preserves last good baseline and checkout with a reason', t => {
  const f = fixture(t), first = f.run();
  f.git(f.seed, 'rm', 'docs/work-policy.md'); f.git(f.seed, 'commit', '-m', 'incompatible'); f.git(f.seed, 'push', 'origin', 'main');
  const result = f.run();
  assert.equal(result.revision, first.revision);
  assert.equal(f.git(f.clone, 'rev-parse', 'HEAD'), first.revision);
  assert.match(result.reason, /Candidate incompatible/);
  assert(result.usable); assert(result.lastAttempt.attemptedAt);
});

test('task A resources stay at A through refresh to B and a resumed handoff', async t => {
  const f = fixture(t);
  const reviewer = '.agents/agents/reviewer.md';
  mkdirSync(path.dirname(path.join(f.seed, reviewer)), { recursive: true });
  writeFileSync(path.join(f.seed, reviewer), 'Reviewer A');
  mkdirSync(path.join(f.seed, 'assets'));
  writeFileSync(path.join(f.seed, 'assets/run.mjs'), "import {value} from './value.mjs'; console.log(value);");
  writeFileSync(path.join(f.seed, 'assets/value.mjs'), "export const value = 'A';");
  writeFileSync(path.join(f.seed, 'assets/image.bin'), Buffer.from([0, 255, 128, 7]));
  f.git(f.seed, 'add', '.'); f.git(f.seed, 'commit', '-m', 'resources A'); f.git(f.seed, 'push', 'origin', 'main');
  const first = f.run();
  const task = { path: f.clone, revision: first.revision };
  const a = materialize(task.path, task.revision, { origin: f.remote });
  writeFileSync(path.join(f.seed, 'policy.md'), 'two');
  writeFileSync(path.join(f.seed, reviewer), 'Reviewer B');
  writeFileSync(path.join(f.seed, 'assets/value.mjs'), "export const value = 'B';");
  f.git(f.seed, 'commit', '-am', 'B'); f.git(f.seed, 'push', 'origin', 'main');
  const second = await runHandbook('check', { directory: f.clone, origin: f.remote, force: true });
  assert.notEqual(second.revision, task.revision);
  const resumed = JSON.parse(JSON.stringify(task));
  assert.equal(materialize(resumed.path, resumed.revision, { origin: f.remote }).resourcePath, a.resourcePath);
  assert.equal(readFileSync(path.join(a.resourcePath, 'policy.md'), 'utf8'), 'one');
  assert.equal(f.git(resumed.path, 'show', `${resumed.revision}:policy.md`), 'one');
  assert.equal(f.git(resumed.path, 'show', `${resumed.revision}:${reviewer}`), 'Reviewer A');
  assert.equal(readFileSync(path.join(a.resourcePath, reviewer), 'utf8'), 'Reviewer A');
  assert.equal(f.git(resumed.path, 'show', `${second.revision}:${reviewer}`), 'Reviewer B');
  assert.equal(execFileSync(process.execPath, [path.join(a.resourcePath, 'assets/run.mjs')], { cwd: f.root, encoding: 'utf8', windowsHide: true }).trim(), 'A');
  assert.deepEqual(readFileSync(path.join(a.resourcePath, 'assets/image.bin')), Buffer.from([0, 255, 128, 7]));
  writeFileSync(path.join(a.resourcePath, 'policy.md'), 'tampered');
  assert.throws(() => materialize(resumed.path, resumed.revision, { origin: f.remote }), /Modified resource/);
});

test('missing checkout reports setup details without creating a directory', async t => {
  const root = mkdtempSync(path.join(tmpdir(), 'handbook-missing-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const directory = path.join(root, 'absent parent', 'handbook');
  for (const command of ['check', 'doctor', 'resources']) {
    await assert.rejects(runHandbook(command, { root, directory }), error => {
      assert.equal(error.code, 'HANDBOOK_SETUP_REQUIRED');
      assert.equal(error.path, directory);
      assert.equal(error.origin, 'https://github.com/Uniwares-LTD/handbook.git');
      assert(error.message.includes(directory));
      assert(error.message.includes(error.origin));
      assert.match(error.message, /After approval, run npm run handbook:setup/);
      return true;
    });
    assert(!existsSync(path.dirname(directory)));
  }
  assert.throws(() => execFileSync(process.execPath,
    ['scripts/handbook.mjs', 'check', '--path', directory], { encoding: 'utf8', stdio: 'pipe' }), error => {
    assert.equal(error.status, 1);
    assert.match(error.stderr, /HANDBOOK_SETUP_REQUIRED/);
    assert(error.stderr.includes(directory));
    return true;
  });
});

test('setup baseline is reused by another consumer and deletion requires setup again', async t => {
  const f = fixture(t), directory = path.join(f.root, 'shared handbook');
  const first = await runHandbook('setup', { directory, origin: f.remote });
  const second = await runHandbook('check', { root: path.join(f.root, 'another-consumer'), directory, origin: f.remote });
  assert.equal(second.revision, first.revision);
  assert.equal(second.path, first.path);
  const consumer = path.join(f.root, 'listed-consumer');
  mkdirSync(consumer);
  writeFileSync(path.join(consumer, 'handbook.json'), JSON.stringify({ guidance: 'docs/local.md', sourceMap: 'docs/map.md', preferences: '.agents/repository.md' }));
  const listed = await runHandbook('check', { root: consumer, directory, origin: f.remote });
  assert.deepEqual(listed.mustRead.slice(2), ['docs/local.md', 'docs/map.md', '.agents/repository.md']);
  assert.equal(listed.mustRead[1].at(-1), `${listed.revision}:docs/guidance/communication.md`);
  rmSync(directory, { recursive: true, force: true });
  await assert.rejects(runHandbook('check', { directory, origin: f.remote }), { code: 'HANDBOOK_SETUP_REQUIRED' });
  assert(!existsSync(directory));
});

test('failed first clone reports failure without claiming a baseline', async t => {
  const root = mkdtempSync(path.join(tmpdir(), 'handbook-failed-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const directory = path.join(root, 'handbook');
  await assert.rejects(runHandbook('setup', { directory, origin: path.join(root, 'unavailable.git') }), /git clone/);
  assert(!existsSync(path.join(directory, '.git', 'uniwares-handbook-baseline.json')));
  const blockedParent = path.join(root, 'blocked');
  writeFileSync(blockedParent, 'preserve');
  await assert.rejects(runHandbook('setup', { directory: path.join(blockedParent, 'handbook') }), /EEXIST|ENOTDIR/);
  assert.equal(readFileSync(blockedParent, 'utf8'), 'preserve');
});

test('launcher setup repeats, ignores dirty helper code and rechecks cached origin', async t => {
  const f = fixture(t), fresh = path.join(f.root, 'fresh');
  const a = await runHandbook('setup', { directory: fresh, origin: f.remote });
  assert.equal((await runHandbook('setup', { directory: fresh, origin: f.remote })).revision, a.revision);
  writeFileSync(path.join(fresh, 'scripts/refresh-handbook.mjs'), 'throw new Error("dirty helper executed")');
  assert.equal((await runHandbook('check', { directory: fresh, origin: f.remote })).revision, a.revision);
  const metadata = f.git(fresh, 'rev-parse', '--absolute-git-dir');
  const before = readFileSync(path.join(metadata, 'uniwares-handbook-attempt.json'), 'utf8');
  const doctor = await runHandbook('doctor', { directory: fresh, root: fresh, origin: f.remote });
  assert.equal(doctor.revision, a.revision);
  assert.deepEqual(doctor.warnings, []);
  assert.equal(readFileSync(path.join(metadata, 'uniwares-handbook-attempt.json'), 'utf8'), before);
  f.git(fresh, 'remote', 'set-url', 'origin', path.join(f.root, 'wrong'));
  await assert.rejects(runHandbook('doctor', { directory: fresh, origin: f.remote }), /Unexpected handbook origin/);
  assert.throws(() => materialize(fresh, a.revision, { origin: f.remote }), /Unexpected handbook origin/);
});

test('protocol mismatch and missing skill are incompatible candidates', t => {
  const f = fixture(t), a = f.run();
  writeFileSync(path.join(f.seed, 'handbook-contract.json'), JSON.stringify({ protocolVersion: 999, skills: [], requiredFiles: [] }));
  f.git(f.seed, 'add', '.'); f.git(f.seed, 'commit', '-m', 'protocol'); f.git(f.seed, 'push', 'origin', 'main');
  assert.match(f.run().reason, /Unsupported Handbook contract/);
  f.git(f.seed, 'rm', 'handbook-contract.json', `.agents/skills/${coreSkills[0]}/SKILL.md`);
  f.git(f.seed, 'commit', '-m', 'missing skill'); f.git(f.seed, 'push', 'origin', 'main');
  assert.equal(f.run().revision, a.revision);
});

test('syntactically broken helper is rejected before promotion or execution', t => {
  const f = fixture(t), a = f.run();
  const file = path.join(f.seed, 'scripts/refresh-handbook.mjs');
  writeFileSync(file, readFileSync(file, 'utf8') + '\nthis is not JavaScript;\n');
  f.git(f.seed, 'commit', '-am', 'broken helper'); f.git(f.seed, 'push', 'origin', 'main');
  const result = f.run();
  assert.equal(result.revision, a.revision);
  assert.match(result.reason, /Candidate incompatible/);
});

test('a newer contract can rename a historical skill and rejects an incomplete rename', async t => {
  const f = fixture(t), baseline = f.run();
  const renamed = 'renamed-skill';
  const old = `.agents/skills/${coreSkills[0]}/SKILL.md`;
  f.git(f.seed, 'rm', old);
  mkdirSync(path.join(f.seed, '.agents/skills', renamed), { recursive: true });
  const newFile = `.agents/skills/${renamed}/SKILL.md`;
  writeFileSync(path.join(f.seed, newFile), `---\nname: ${renamed}\ndescription: Example.\n---\n`);
  writeFileSync(path.join(f.seed, 'handbook-contract.json'), JSON.stringify({
    protocolVersion: 1, requiredFiles: [], skills: [renamed, ...coreSkills.slice(1)]
  }));
  f.git(f.seed, 'add', '.'); f.git(f.seed, 'commit', '-m', 'rename'); f.git(f.seed, 'push', 'origin', 'main');
  const upgraded = f.run();
  assert.notEqual(upgraded.revision, baseline.revision);
  // First-use recovery must load the new helper with no old baseline metadata.
  const replacement = path.join(f.root, 'replacement');
  const recovered = await runHandbook('setup', { directory: replacement, root: f.root, origin: f.remote });
  assert.equal(recovered.revision, upgraded.revision);
  f.git(f.seed, 'rm', newFile); f.git(f.seed, 'commit', '-m', 'incomplete rename'); f.git(f.seed, 'push', 'origin', 'main');
  assert.equal(f.run().revision, upgraded.revision);
});

test('a target-based delivery preserves target work and can be reverted through its first parent', t => {
  const { seed, git } = fixture(t);
  const base = git(seed, 'rev-parse', 'HEAD');
  const policy = path.join(seed, 'policy.md');
  git(seed, 'switch', '-c', 'source');
  writeFileSync(policy, 'source');
  git(seed, 'commit', '-am', 'source change');
  const source = git(seed, 'rev-parse', 'HEAD');
  git(seed, 'switch', '-c', 'target', base);
  writeFileSync(policy, 'target');
  writeFileSync(path.join(seed, 'target-only.md'), 'keep');
  git(seed, 'add', '.'); git(seed, 'commit', '-m', 'target change');
  const target = git(seed, 'rev-parse', 'HEAD');
  git(seed, 'switch', '-c', 'delivery', target);
  assert.throws(() => git(seed, 'merge', '--no-commit', source));
  assert.equal(git(seed, 'diff', '--name-only', '--diff-filter=U'), 'policy.md');
  writeFileSync(policy, 'resolved');
  git(seed, 'add', 'policy.md'); git(seed, 'commit', '-m', 'resolve delivery');
  const delivery = git(seed, 'rev-parse', 'HEAD');
  assert.equal(git(seed, 'diff', '--name-only', target, delivery), 'policy.md');
  git(seed, 'switch', 'target');
  // A moved target invalidates the first review before the promotion can merge.
  writeFileSync(path.join(seed, 'later.md'), 'keep later target change');
  git(seed, 'add', 'later.md'); git(seed, 'commit', '-m', 'target advanced');
  const updatedTarget = git(seed, 'rev-parse', 'HEAD');
  assert.notEqual(updatedTarget, target);
  git(seed, 'switch', '-c', 'revised-delivery');
  assert.throws(() => git(seed, 'merge', '--no-commit', source));
  writeFileSync(policy, 'resolved');
  git(seed, 'add', 'policy.md'); git(seed, 'commit', '-m', 'resolve against current target');
  const revisedDelivery = git(seed, 'rev-parse', 'HEAD');
  assert.equal(git(seed, 'diff', '--name-only', updatedTarget, revisedDelivery), 'policy.md');
  git(seed, 'switch', 'target');
  git(seed, 'merge', '--no-ff', '--no-edit', revisedDelivery);
  const deployed = git(seed, 'rev-parse', 'HEAD');
  assert.notEqual(deployed, target);
  git(seed, 'switch', '-c', 'rollback');
  git(seed, 'revert', '-m', '1', '--no-edit', deployed);
  assert.equal(git(seed, 'diff', '--name-only', updatedTarget, 'HEAD'), '');
});

test('required reviewer role is enforced by the candidate contract', t => {
  const f = fixture(t);
  const contract = path.join(f.seed, 'handbook-contract.json');
  const role = '.agents/agents/reviewer.md';
  writeFileSync(contract, JSON.stringify({ protocolVersion: 1, requiredFiles: [], skills: coreSkills }));
  f.git(f.seed, 'add', 'handbook-contract.json');
  f.git(f.seed, 'commit', '-m', 'older v1 contract');
  f.git(f.seed, 'push', 'origin', 'main');
  const baseline = f.run();
  assert.equal(baseline.revision, f.git(f.seed, 'rev-parse', 'HEAD'));
  writeFileSync(contract, JSON.stringify({ protocolVersion: 1, requiredFiles: [role], skills: coreSkills }));
  f.git(f.seed, 'commit', '-am', 'declare required reviewer');
  f.git(f.seed, 'push', 'origin', 'main');
  const result = f.run();
  assert.equal(result.revision, baseline.revision);
  assert.match(result.reason, /reviewer\.md/);
});

test('missing indexed resource prevents candidate promotion', t => {
  const f = fixture(t), a = f.run();
  writeFileSync(path.join(f.seed, 'handbook-contract.json'), JSON.stringify({ protocolVersion: 1, requiredFiles: [], skills: coreSkills, resourceIndex: 'skills-lock.json' }));
  writeFileSync(path.join(f.seed, 'skills-lock.json'), JSON.stringify({ files: { '.agents/skills/work-on-task/assets/missing.md': 'hash' } }));
  f.git(f.seed, 'add', '.'); f.git(f.seed, 'commit', '-m', 'missing resource'); f.git(f.seed, 'push', 'origin', 'main');
  const result = f.run();
  assert.equal(result.revision, a.revision);
  assert.match(result.reason, /Missing indexed resource/);
});

test('missing actual exports retain last-good baseline despite matching strings and comments', async t => {
  const f = fixture(t), a = f.run();
  const file = path.join(f.seed, 'scripts/refresh-handbook.mjs');
  const original = readFileSync(file, 'utf8');
  for (const name of ['refresh', 'diagnose']) {
    const broken = original.replace(new RegExp(`^export function ${name}\\(`, 'm'), `function ${name}(`) +
      `\n// export function ${name}(\nconst misleading = 'export function ${name}(';\nthrow new Error('candidate must not execute');\n`;
    writeFileSync(file, broken);
    f.git(f.seed, 'commit', '-am', `unexport ${name}`); f.git(f.seed, 'push', 'origin', 'main');
    const result = f.run();
    assert.equal(result.revision, a.revision);
    assert.match(result.reason, /does not provide an export named/);
    assert.equal(f.git(f.clone, 'rev-parse', 'HEAD'), a.revision);
    assert.equal((await runHandbook('doctor', { root: f.clone, directory: f.clone, origin: f.remote })).revision, a.revision);
  }
});

test('export validation accepts aliases without executing candidate top-level code', async t => {
  const f = fixture(t);
  const file = path.join(f.seed, 'scripts/refresh-handbook.mjs');
  const source = readFileSync(file, 'utf8').replace(/^export function diagnose\(/m, 'function diagnose(');
  writeFileSync(file, source + "\nexport { diagnose };\nthrow new Error('candidate must not execute');\n");
  f.git(f.seed, 'commit', '-am', 'alias'); f.git(f.seed, 'push', 'origin', 'main');
  assert.equal(f.run().mode, 'updated');
  // Use a second fixture to confirm the launcher also accepts export aliases.
  const clean = fixture(t), cleanFile = path.join(clean.seed, 'scripts/refresh-handbook.mjs');
  writeFileSync(cleanFile, source + '\nexport { diagnose };\n');
  clean.git(clean.seed, 'commit', '-am', 'loadable alias'); clean.git(clean.seed, 'push', 'origin', 'main');
  const a = clean.run();
  assert.equal((await runHandbook('doctor', { root: clean.clone, directory: clean.clone, origin: clean.remote })).revision, a.revision);
});

test('doctor preserves baseline diagnostics and files when consumer metadata is invalid', async t => {
  const f = fixture(t), a = f.run();
  const metadata = f.git(f.clone, 'rev-parse', '--absolute-git-dir');
  const attempt = readFileSync(path.join(metadata, 'uniwares-handbook-attempt.json'), 'utf8');
  for (const content of ['{broken', 'null', '{"version":1,"kind":"consumer","technologySkills":42}', '{"version":1,"kind":"consumer","technologySkills":"playwright"}']) {
    const file = path.join(f.clone, 'handbook.json');
    writeFileSync(file, content);
    const result = await runHandbook('doctor', { root: f.clone, directory: f.clone, origin: f.remote });
    assert.equal(result.revision, a.revision);
    assert.equal(result.origin, f.remote);
    assert(result.warnings.some(w => /Invalid handbook.json/.test(w)));
    assert.equal(readFileSync(file, 'utf8'), content);
    assert.equal(readFileSync(path.join(metadata, 'uniwares-handbook-attempt.json'), 'utf8'), attempt);
  }
});

test('first setup never executes helper from unaccepted ahead-of-main commit', async t => {
  const f = fixture(t);
  f.git(f.clone, 'config', 'user.name', 'Fixture'); f.git(f.clone, 'config', 'user.email', 'fixture@example.invalid');
  const file = path.join(f.clone, 'scripts/refresh-handbook.mjs');
  writeFileSync(file, readFileSync(file, 'utf8') + '\nthrow new Error("unaccepted helper executed");\n');
  f.git(f.clone, 'commit', '-am', 'local helper');
  await assert.rejects(runHandbook('setup', { directory: f.clone, origin: f.remote }), /ahead, diverged/);
});

test('actual Handbook working sources form a compatible committed candidate', t => {
  const f = fixture(t), a = f.run();
  for (const name of ['docs', 'scripts', '.agents', 'handbook-contract.json', 'skills-lock.json']) {
    cpSync(new URL(`../${name}`, import.meta.url), path.join(f.seed, name), { recursive: true });
  }
  f.git(f.seed, 'add', '.'); f.git(f.seed, 'commit', '-m', 'candidate'); f.git(f.seed, 'push', 'origin', 'main');
  const result = f.run();
  assert.equal(result.mode, 'updated');
  assert.notEqual(result.revision, a.revision);
});
const config = { id:'P1',number:2,url:'https://github.com/orgs/Uniwares-LTD/projects/2',organization:'Uniwares-LTD',title:'Uniwares',repositories:['Uniwares-LTD/handbook'] };
function mock({ failWrite = false, graphErrors = false } = {}) {
  const enrolled = new Set(['I1']), writes = [];
  const api = args => {
    if (args.includes('graphql')) {
      const query = args.find(arg => arg.startsWith('query='));
      if (graphErrors) return { errors:[{message:'denied'}] };
      if (query.includes('mutation')) {
        if (failWrite) throw new Error('offline');
        const id = args.find(arg => arg.startsWith('content=')).slice(8); writes.push(id); enrolled.add(id);
        return {data:{addProjectV2ItemById:{item:{id:'ITEM'}}}};
      }
      if (query.includes('... on ProjectV2Item{project')) return {data:{node:{project:{id:'P1'},content:{id:'I2'}}}};
      return {data:{node:{number:2,title:'Uniwares',owner:{login:'Uniwares-LTD'},items:{nodes:[...enrolled].map(id=>({content:{id}})),pageInfo:{hasNextPage:false}}}}};
    }
    return [[{number:1,node_id:'I1',title:'Existing'},{number:2,node_id:'I2',title:'New'},{number:3,node_id:'PR',title:'PR',pull_request:{}}]];
  };
  return {api,writes};
}
test('report is read-only, omits PRs, and duplicate applies are idempotent', () => {
  const m=mock(); assert.deepEqual(reconcile(config,m).missing,[{reference:'Uniwares-LTD/handbook#2',title:'New'}]); assert.deepEqual(m.writes,[]);
  reconcile(config,{...m,apply:['Uniwares-LTD/handbook#1','Uniwares-LTD/handbook#2','Uniwares-LTD/handbook#2']});
  reconcile(config,{...m,apply:['Uniwares-LTD/handbook#2']}); assert.deepEqual(m.writes,['I2']);
});
test('failed API and GraphQL errors cannot be reported as successful enrollment', () => {
  assert.throws(()=>reconcile(config,{...mock({failWrite:true}),apply:['Uniwares-LTD/handbook#2']}),/offline/);
  assert.throws(()=>reconcile(config,mock({graphErrors:true})),/GraphQL returned errors/);
});
test('invalid selection fails before writes; unknown project is rejected', () => {
  const m=mock(); assert.throws(()=>reconcile(config,{...m,apply:['Uniwares-LTD/handbook#2','Uniwares-LTD/handbook#99']}),/not an accessible open issue/);
  assert.deepEqual(m.writes,[]); assert.throws(()=>reconcile({...config,organization:'Wrong'},m),/organization/);
  assert.throws(()=>reconcile(config,{...m,apply:['Other/repo#1']}),/invalid issue/);
});
test('project number resolves to a GraphQL ID without requiring stored opaque IDs', () => {
  const m = mock();
  const api = args => args.some(arg => arg.includes('projectV2(number:2)')) ? {data:{organization:{projectV2:{id:'P1'}}}} : m.api(args);
  assert.equal(reconcile({...config,id:undefined},{api}).missing.length,1);
});
