// Read-only organization access check against docs/organization-access.md. Issues GET requests only.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ghJson } from './enroll.mjs';

export const model = { admin: { role: 'all_repo_admin', repo: 'admin' }, dev: { role: 'all_repo_write', repo: 'write' }, support: { role: 'all_repo_triage', repo: 'triage' } };
const orgPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;

// Each read records a limitation instead of failing the whole inventory; null means unknown, never empty.
function reader(api, limitations) {
  const read = (endpoint, paginate = true) => {
    try {
      const result = api(['api', ...(paginate ? ['--paginate', '--slurp'] : []), endpoint]);
      if (paginate && (!Array.isArray(result) || !result.every(Array.isArray))) throw new Error('Unexpected list response.');
      return paginate ? result.flat() : result;
    } catch (error) { limitations.push(`${endpoint}: ${error.message}`); return null; }
  };
  return read;
}
const logins = list => list?.map(item => item.login) ?? null;

export function inventory(org, { api = ghJson } = {}) {
  if (!orgPattern.test(org)) throw new Error(`Invalid organization: ${org}`);
  const limitations = [], read = reader(api, limitations);
  const o = read(`orgs/${org}`, false);
  const settings = o && { plan: o.plan?.name ?? null, defaultRepositoryPermission: o.default_repository_permission ?? null, membersCanCreateRepositories: o.members_can_create_repositories ?? null, twoFactorRequired: o.two_factor_requirement_enabled ?? null };
  const teams = read(`orgs/${org}/teams`)?.map(team => ({
    slug: team.slug, name: team.name, privacy: team.privacy,
    members: logins(read(`orgs/${org}/teams/${team.slug}/members`)),
    repos: read(`orgs/${org}/teams/${team.slug}/repos`)?.map(repo => ({ name: repo.name, role: repo.role_name })) ?? null,
  })) ?? null;
  // The roles list is an object, not a page array; a missing admin:org scope reports 404 here.
  const roleList = read(`orgs/${org}/organization-roles`, false);
  const roles = roleList?.roles ? Object.fromEntries(roleList.roles.filter(role => role.name.startsWith('all_repo_'))
    .map(role => [role.name, { id: role.id, teams: read(`orgs/${org}/organization-roles/${role.id}/teams`)?.map(team => team.slug) ?? null }])) : null;
  const repos = read(`orgs/${org}/repos?type=all`)?.map(repo => ({
    name: repo.name, visibility: repo.visibility, archived: repo.archived,
    direct: repo.archived ? [] : read(`repos/${org}/${repo.name}/collaborators?affiliation=direct`)?.map(user => ({ login: user.login, role: user.role_name })) ?? null,
  })) ?? null;
  limitations.push('Project team access is browser-only: Project → ⋯ → Settings → Manage access.');
  return {
    org, settings, roles, teams, repos, limitations,
    owners: logins(read(`orgs/${org}/members?role=admin`)),
    members: logins(read(`orgs/${org}/members?role=member`)),
    without2fa: logins(read(`orgs/${org}/members?filter=2fa_disabled`)),
    outsideCollaborators: logins(read(`orgs/${org}/outside_collaborators`)),
    invitations: read(`orgs/${org}/invitations`)?.length ?? null,
  };
}

// Differences from the model; recorded local exceptions are compared by the human.
export function gaps(inv) {
  const found = [], add = (code, detail) => found.push({ code, detail });
  const unknown = (value, what) => { if (value === null || value === undefined) { add('unknown', `${what} could not be read`); return true; } return false; };
  const s = inv.settings;
  if (!unknown(s, 'organization settings')) {
    if (s.defaultRepositoryPermission !== 'none') add('base-permission', `base repository permission is ${s.defaultRepositoryPermission ?? 'unknown'}, expected none`);
    if (s.twoFactorRequired !== true) add('two-factor', s.twoFactorRequired === false ? '2FA is not required' : '2FA requirement unknown (needs an Owner credential)');
  }
  if (!unknown(inv.without2fa, 'members without 2FA') && inv.without2fa.length) add('members-without-2fa', inv.without2fa.join(', '));
  const teams = inv.teams ? new Map(inv.teams.map(team => [team.slug, team])) : null;
  if (!unknown(teams, 'teams')) {
    for (const slug of Object.keys(model)) {
      const team = teams.get(slug);
      if (!team) add('missing-team', slug);
      else if (team.privacy !== 'closed') add('team-visibility', `${slug} is ${team.privacy}, expected visible (closed)`);
    }
    for (const slug of teams.keys()) if (!model[slug]) add('extra-team', slug);
  }
  const admins = teams?.get('admin')?.members;
  if (teams?.has('admin')) unknown(admins, 'admin members');
  if (!unknown(inv.owners, 'owners')) {
    if (inv.owners.length < 2) add('owner-count', `${inv.owners.length} Owner(s); keep at least two`);
    if (admins) {
      const notAdmin = inv.owners.filter(login => !admins.includes(login)), notOwner = admins.filter(login => !inv.owners.includes(login));
      if (notAdmin.length) add('owner-not-in-admin', notAdmin.join(', '));
      if (notOwner.length) add('admin-not-owner', notOwner.join(', '));
    }
  }
  // Organization roles are preferred; without them each active repository needs the team grants.
  const fallback = inv.roles === null || Object.values(model).some(({ role }) => !inv.roles[role]);
  if (fallback) add('roles-unavailable', 'all-repository roles unavailable or unreadable (needs admin:org); per-repository grants apply');
  else for (const [slug, { role }] of Object.entries(model)) {
    const holders = inv.roles[role].teams;
    if (unknown(holders, `${role} assignments`)) continue;
    if (!holders.includes(slug)) add('missing-role', `${slug} lacks ${role}`);
    for (const other of holders.filter(holder => holder !== slug)) add('extra-role', `${other} holds ${role}`);
  }
  for (const team of inv.teams ?? []) {
    if (unknown(team.repos, `${team.slug} repositories`)) continue;
    for (const repo of team.repos) if (!fallback || model[team.slug]?.repo !== repo.role) add('repo-grant', `${team.slug} has ${repo.role} on ${repo.name}`);
  }
  if (!unknown(inv.repos, 'repositories')) for (const repo of inv.repos.filter(repo => !repo.archived)) {
    if (fallback && teams) for (const [slug, { repo: role }] of Object.entries(model)) if (teams.get(slug)?.repos && !teams.get(slug).repos.some(grant => grant.name === repo.name && grant.role === role)) add('missing-repo-grant', `${slug} lacks ${role} on ${repo.name}`);
    if (!unknown(repo.direct, `${repo.name} collaborators`)) for (const user of repo.direct) add('direct-collaborator', `${user.login} has ${user.role} on ${repo.name}`);
  }
  if (!unknown(inv.outsideCollaborators, 'outside collaborators') && inv.outsideCollaborators.length) add('outside-collaborators', inv.outsideCollaborators.join(', '));
  if (inv.invitations) add('pending-invitations', `${inv.invitations} pending`);
  // An unreadable team could hold anyone, so placement is only judged when every team was read.
  if (inv.members && teams && [...teams.values()].every(team => team.members)) {
    const placed = new Set([...teams.values()].flatMap(team => team.members));
    const unplaced = inv.members.filter(login => !placed.has(login));
    if (unplaced.length) add('member-without-team', unplaced.join(', '));
  }
  return found;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), orgs = [];
    let full = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--org' && args[i + 1]) orgs.push(args[++i]);
      else if (args[i] === '--full') full = true;
      else throw new Error('Usage: org-access.mjs --org ORG [--org ORG ...] [--full]');
    }
    if (!orgs.length) throw new Error('Usage: org-access.mjs --org ORG [--org ORG ...] [--full]');
    const report = orgs.map(org => {
      const inv = inventory(org);
      return { org, settings: inv.settings, gaps: gaps(inv), limitations: inv.limitations, ...(full ? { inventory: inv } : {}) };
    });
    console.log(JSON.stringify(report, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
