import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const expectedOrigin = 'https://github.com/Uniwares-LTD/handbook.git';
export function refresh(directory, { origin = expectedOrigin } = {}) {
  const cwd = path.resolve(directory);
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }).trim();
  const actual = git('remote', 'get-url', 'origin');
  const normalize = value => value.replace(/^git@github.com:/, 'https://github.com/').replace(/\.git$/, '').replace(/\/$/, '').toLowerCase();
  if (normalize(actual) !== normalize(origin)) throw new Error('Unexpected handbook origin; no refresh or baseline fallback performed.');
  const metadata = git('rev-parse', '--absolute-git-dir');
  const baselineFile = path.join(metadata, 'uniwares-handbook-baseline.json');
  const fallback = limitation => {
    if (!existsSync(baselineFile)) throw new Error(`${limitation}; no synchronized baseline exists. Stop policy-dependent work.`);
    const baseline = JSON.parse(readFileSync(baselineFile, 'utf8'));
    if (normalize(baseline.origin) !== normalize(origin) || !/^[a-f0-9]{40,64}$/.test(baseline.revision)) throw new Error('Invalid handbook baseline.');
    git('cat-file', '-e', `${baseline.revision}^{commit}`);
    return { path: cwd, revision: baseline.revision, fresh: false, limitation, read: ['git', '-C', cwd, 'show', `${baseline.revision}:docs/work-policy.md`] };
  };
  if (git('status', '--porcelain', '--untracked-files=all')) return fallback('Handbook checkout has local changes');
  if (git('branch', '--show-current') !== 'main') return fallback('Handbook checkout is not on main');
  try { git('fetch', '--no-tags', 'origin', 'refs/heads/main:refs/remotes/origin/main'); }
  catch { return fallback('Could not fetch handbook main'); }
  const remote = git('rev-parse', 'refs/remotes/origin/main');
  try { git('merge-base', '--is-ancestor', 'HEAD', remote); }
  catch { return fallback('Handbook main is ahead of or diverged from origin/main'); }
  try { git('merge', '--ff-only', remote); }
  catch { return fallback('Handbook fast-forward failed; inspect checkout before retry'); }
  if (git('status', '--porcelain', '--untracked-files=all')) return fallback('Checkout changed during refresh');
  const revision = git('rev-parse', 'HEAD');
  if (revision !== remote) return fallback('Checkout revision changed during refresh');
  const baseline = { origin, revision, synchronizedAt: new Date().toISOString() };
  writeFileSync(`${baselineFile}.tmp`, JSON.stringify(baseline, null, 2) + '\n');
  renameSync(`${baselineFile}.tmp`, baselineFile);
  return { path: cwd, revision, fresh: true, read: ['git', '-C', cwd, 'show', `${revision}:docs/work-policy.md`] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 2 || args[0] !== '--path')) throw new Error('Usage: node scripts/refresh-handbook.mjs [--path directory]');
    const ownRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    const directory = args[1] || process.env.UNIWARES_HANDBOOK_PATH || (path.resolve(process.cwd()) === ownRoot ? ownRoot : path.resolve('..', 'handbook'));
    console.log(JSON.stringify(refresh(directory), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
