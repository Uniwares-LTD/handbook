import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, renameSync, existsSync, openSync, closeSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const expectedOrigin = 'https://github.com/Uniwares-LTD/handbook.git';
export const intervalMs = 4 * 60 * 60 * 1000;
export const normalizeOrigin = value => value.replace(/^git@github.com:/, 'https://github.com/').replace(/\.git\/?$/, '').replace(/\/$/, '').toLowerCase();
const gitAt = cwd => (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000, windowsHide: true }).trim();
const readJson = file => existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
export const protocolVersion = 1;
export const coreSkills = ['capture-project-learnings', 'compile-feature-spec', 'manage-issues', 'review-change', 'sync-docs-issues', 'work-on-task'];
export function validateRevision(directory, revision) {
  const git = gitAt(directory);
  if (!/^[a-f0-9]{40,64}$/.test(revision)) throw new Error('Expected a full committed revision.');
  git('cat-file', '-e', `${revision}^{commit}`);
  const read = file => git('show', `${revision}:${file}`);
  for (const file of ['docs/work-policy.md', 'docs/project.md', 'docs/onboarding.md']) {
    if (!read(file).trim()) throw new Error(`Empty required guidance: ${file}`);
  }
  const helper = read('scripts/refresh-handbook.mjs');
  // Parse and link without evaluating candidate code. Named-import resolution checks
  // real exports, including aliases; comments and string literals cannot satisfy it.
  const probe = `
    import { readFileSync } from 'node:fs';
    import { SourceTextModule, SyntheticModule } from 'node:vm';
    import { isBuiltin } from 'node:module';
    const candidate = new SourceTextModule(readFileSync(0, 'utf8'));
    const builtins = new Map();
    await candidate.link(async specifier => {
      if (!isBuiltin(specifier)) throw new Error('Protocol 1 requires a self-contained helper with builtin imports.');
      if (!builtins.has(specifier)) builtins.set(specifier,
        new SyntheticModule(Object.keys(await import(specifier)), () => {}));
      return builtins.get(specifier);
    });
    const contract = new SourceTextModule("import { refresh, diagnose } from 'candidate';");
    await contract.link(() => candidate);
  `;
  execFileSync(process.execPath, ['--experimental-vm-modules', '--input-type=module', '-e', probe], { input: helper, encoding: 'utf8', windowsHide: true, timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'] });
  let contract;
  // Pre-contract baselines remain supported by existing launchers.
  const files = git('ls-tree', '--name-only', revision).split('\n');
  if (files.includes('handbook-contract.json')) {
    contract = JSON.parse(read('handbook-contract.json'));
    if (contract.protocolVersion !== protocolVersion || !Array.isArray(contract.skills) || !Array.isArray(contract.requiredFiles)) throw new Error('Unsupported Handbook contract.');
    for (const file of contract.requiredFiles) if (!read(file).trim()) throw new Error(`Empty required resource: ${file}`);
    if (contract.resourceIndex) {
      const index = JSON.parse(read(contract.resourceIndex));
      if (!index.files || typeof index.files !== 'object' || Array.isArray(index.files)) throw new Error('Invalid resource index.');
      const committed = new Set(git('ls-tree', '-r', '--name-only', revision).split('\n'));
      for (const file of Object.keys(index.files)) if (!committed.has(file)) throw new Error(`Missing indexed resource: ${file}`);
    }
  }
  for (const name of new Set(contract ? contract.skills : coreSkills)) {
    if (!/^[a-z0-9-]+$/.test(name)) throw new Error('Invalid shared skill name.');
    const body = read(`.agents/skills/${name}/SKILL.md`);
    const declared = body.match(/^name: ["']?([^\r\n"']+)/m)?.[1];
    if (declared !== name || !/^description: .+/m.test(body)) throw new Error(`Incompatible skill: ${name}`);
  }
  return { protocolVersion, revision };
}
function context(directory, origin) {
  const cwd = path.resolve(directory), git = gitAt(cwd);
  if (normalizeOrigin(git('remote', 'get-url', 'origin')) !== normalizeOrigin(origin)) throw new Error('Unexpected handbook origin; no refresh or baseline fallback performed.');
  const metadata = git('rev-parse', '--absolute-git-dir');
  const baselineFile = path.join(metadata, 'uniwares-handbook-baseline.json');
  const attemptFile = path.join(metadata, 'uniwares-handbook-attempt.json');
  const baseline = readJson(baselineFile);
  if (baseline) {
    if (normalizeOrigin(baseline.origin) !== normalizeOrigin(origin) || !/^[a-f0-9]{40,64}$/.test(baseline.revision)) throw new Error('Invalid handbook baseline.');
    git('cat-file', '-e', `${baseline.revision}^{commit}`);
    validateRevision(cwd, baseline.revision);
  }
  return { cwd, git, metadata, baselineFile, attemptFile, baseline, attempt: readJson(attemptFile) };
}
function result(c, baseline, mode, limitation) {
  if (!baseline) throw new Error(`${limitation || 'Guidance unavailable'}; no synchronized baseline exists. Run setup; pause only handbook-dependent decisions.`);
  return { path: c.cwd, revision: baseline.revision, fresh: mode === 'updated', mode,
    synchronizedAt: baseline.synchronizedAt, usable: true, status: 'usable',
    lastAttempt: readJson(c.attemptFile), outcome: mode,
    reason: limitation || (mode === 'updated' ? 'Synchronized compatible main.' : 'Within refresh cooldown.'),
    ...(limitation ? { limitation } : {}),
    // The check is often the only start step a session runs, so it names every required read.
    mustRead: startReads.map(file => ['git', '-C', c.cwd, 'show', `${baseline.revision}:${file}`]),
    next: 'Before the first action: read each mustRead file and the guidance, source map and preferences named in handbook.json; load the skill for the request in this session; reply with the communication guide headings.',
    read: ['git', '-C', c.cwd, 'show', `${baseline.revision}:docs/work-policy.md`] };
}
const startReads = ['docs/bootstrap.md', 'docs/guidance/communication.md'];
function writeJson(file, value) {
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n');
  renameSync(temporary, file);
}
export function diagnose(directory, { origin = expectedOrigin, now = Date.now() } = {}) {
  const c = context(directory, origin);
  return { path: c.cwd, origin, branch: c.git('branch', '--show-current'),
    dirty: Boolean(c.git('status', '--porcelain', '--untracked-files=all')),
    revision: c.baseline?.revision ?? null, synchronizedAt: c.baseline?.synchronizedAt ?? null,
    cacheAgeHours: c.baseline ? (now - Date.parse(c.baseline.synchronizedAt)) / 3600000 : null,
    lastAttempt: c.attempt, refreshInProgress: existsSync(path.join(c.metadata, 'uniwares-handbook-refresh.lock')) };
}
export function refresh(directory, { origin = expectedOrigin, force = false, now = Date.now() } = {}) {
  let c = context(directory, origin);
  const cached = limitation => result(c, c.baseline, 'cached', limitation);
  const previousTime = Date.parse(c.attempt?.attemptedAt ?? c.baseline?.synchronizedAt);
  if (!force && c.baseline && now >= previousTime && now - previousTime < intervalMs) {
    return cached(c.attempt?.limitation);
  }
  const lock = path.join(c.metadata, 'uniwares-handbook-refresh.lock');
  let descriptor;
  try { descriptor = openSync(lock, 'wx'); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    return cached('Another handbook refresh is running; reuse the cache or retry setup after it finishes.');
  }
  try {
    writeFileSync(descriptor, JSON.stringify({ pid: process.pid, startedAt: new Date(now).toISOString() }));
    // Re-read after acquiring the lock: another caller may have completed a refresh.
    c = context(directory, origin);
    const latest = Date.parse(c.attempt?.attemptedAt ?? c.baseline?.synchronizedAt);
    if (!force && c.baseline && now >= latest && now - latest < intervalMs) return cached(c.attempt?.limitation);
    const attemptedAt = new Date(now).toISOString();
    const fail = limitation => {
      writeJson(c.attemptFile, { attemptedAt, limitation });
      return cached(limitation);
    };
    writeJson(c.attemptFile, { attemptedAt, limitation: 'Previous refresh did not finish; cached guidance remains usable.' });
    if (c.git('status', '--porcelain', '--untracked-files=all')) return fail('Handbook checkout has local changes; preserved.');
    if (c.git('branch', '--show-current') !== 'main') return fail('Handbook checkout is not on main; preserved.');
    try { c.git('fetch', '--no-tags', 'origin', 'refs/heads/main:refs/remotes/origin/main'); }
    catch { return fail('Could not fetch handbook main; using cached guidance.'); }
    const remote = c.git('rev-parse', 'refs/remotes/origin/main');
    try { validateRevision(c.cwd, remote); }
    catch (error) { return fail(`Candidate incompatible; previous baseline retained: ${error.message}`); }
    try { c.git('merge-base', '--is-ancestor', 'HEAD', remote); }
    catch { return fail('Handbook main is ahead of or diverged from origin/main; preserved.'); }
    try { c.git('merge', '--ff-only', remote); }
    catch { return fail('Handbook fast-forward failed; inspect checkout before retry.'); }
    if (c.git('status', '--porcelain', '--untracked-files=all') || c.git('rev-parse', 'HEAD') !== remote) return fail('Checkout changed during refresh; using previous baseline.');
    const baseline = { origin, revision: remote, synchronizedAt: attemptedAt };
    writeJson(c.baselineFile, baseline);
    writeJson(c.attemptFile, { attemptedAt });
    return result(c, baseline, 'updated');
  } finally { closeSync(descriptor); unlinkSync(lock); }
}

if (import.meta.url.startsWith('file:') && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2); let directory, force = false, doctor = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--path' && args[i + 1]) directory = args[++i];
      else if (args[i] === '--force') force = true;
      else if (args[i] === '--doctor') doctor = true;
      else throw new Error('Usage: node scripts/refresh-handbook.mjs [--path directory] [--force] [--doctor]');
    }
    const ownRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    directory ||= process.env.UNIWARES_HANDBOOK_PATH || (path.resolve(process.cwd()) === ownRoot ? ownRoot : path.resolve('..', 'handbook'));
    console.log(JSON.stringify(doctor ? diagnose(directory) : refresh(directory, { force }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
