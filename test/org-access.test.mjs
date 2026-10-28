import test from 'node:test';
import assert from 'node:assert/strict';
import { inventory, gaps } from '../scripts/org-access.mjs';

// Mocked GitHub REST responses keyed by endpoint; list endpoints return slurped pages.
function fixture(overrides = {}) {
  const team = (slug, privacy = 'closed') => ({ slug, name: slug, privacy });
  const data = {
    'orgs/Example': { plan: { name: 'free' }, default_repository_permission: 'none', members_can_create_repositories: true, two_factor_requirement_enabled: true },
    'orgs/Example/teams': [[team('admin'), team('dev'), team('support')]],
    'orgs/Example/teams/admin/members': [[{ login: 'a1' }, { login: 'a2' }]],
    'orgs/Example/teams/dev/members': [[{ login: 'd1' }]],
    'orgs/Example/teams/support/members': [[{ login: 's1' }]],
    'orgs/Example/teams/admin/repos': [[]], 'orgs/Example/teams/dev/repos': [[]], 'orgs/Example/teams/support/repos': [[]],
    'orgs/Example/organization-roles': { roles: [{ id: 1, name: 'all_repo_admin' }, { id: 2, name: 'all_repo_write' }, { id: 3, name: 'all_repo_triage' }, { id: 4, name: 'security_manager' }] },
    'orgs/Example/organization-roles/1/teams': [[{ slug: 'admin' }]],
    'orgs/Example/organization-roles/2/teams': [[{ slug: 'dev' }]],
    'orgs/Example/organization-roles/3/teams': [[{ slug: 'support' }]],
    'orgs/Example/repos?type=all': [[{ name: 'app', visibility: 'private', archived: false }, { name: 'old', visibility: 'private', archived: true }]],
    'repos/Example/app/collaborators?affiliation=direct': [[]],
    'orgs/Example/members?role=admin': [[{ login: 'a1' }, { login: 'a2' }]],
    'orgs/Example/members?role=member': [[{ login: 'd1' }, { login: 's1' }]],
    'orgs/Example/members?filter=2fa_disabled': [[]],
    'orgs/Example/outside_collaborators': [[]],
    'orgs/Example/invitations': [[]],
    ...overrides,
  };
  const calls = [];
  const api = args => {
    calls.push(args);
    const endpoint = args.at(-1);
    if (!(endpoint in data) || data[endpoint] instanceof Error) throw data[endpoint] ?? new Error(`unmocked ${endpoint}`);
    return structuredClone(data[endpoint]);
  };
  return { api, calls };
}
const codes = list => list.map(gap => gap.code);

test('a conforming organization has no gaps and only GET requests', () => {
  const { api, calls } = fixture();
  const inv = inventory('Example', { api });
  assert.deepEqual(gaps(inv), []);
  assert(calls.every(args => args[0] === 'api' && !args.includes('-X') && !args.includes('--method')));
  assert(!calls.some(args => args.at(-1).includes('/old/')), 'archived repositories are not queried');
});

test('drift is reported against the model', () => {
  const { api } = fixture({
    'orgs/Example': { plan: { name: 'free' }, default_repository_permission: 'read', two_factor_requirement_enabled: false },
    'orgs/Example/teams': [[{ slug: 'admin', privacy: 'closed' }, { slug: 'dev', privacy: 'secret' }, { slug: 'qa', privacy: 'closed' }]],
    'orgs/Example/teams/admin/members': [[{ login: 'a1' }, { login: 'x' }]],
    'orgs/Example/teams/qa/members': [[]],
    'orgs/Example/teams/qa/repos': [[{ name: 'app', role_name: 'triage' }]],
    'orgs/Example/organization-roles/2/teams': [[{ slug: 'qa' }]],
    'repos/Example/app/collaborators?affiliation=direct': [[{ login: 'c', role_name: 'admin' }]],
    'orgs/Example/members?role=admin': [[{ login: 'a1' }]],
    'orgs/Example/members?filter=2fa_disabled': [[{ login: 'd1' }]],
    'orgs/Example/invitations': [[{ login: 'new' }]],
  });
  assert.deepEqual(codes(gaps(inventory('Example', { api }))), ['base-permission', 'two-factor', 'members-without-2fa', 'team-visibility', 'missing-team', 'extra-team',
    'owner-count', 'admin-not-owner', 'missing-role', 'extra-role', 'repo-grant', 'direct-collaborator', 'pending-invitations', 'member-without-team']);
});

test('unreadable fields are unknown, never empty or disabled', () => {
  const { api } = fixture({ 'orgs/Example/members?filter=2fa_disabled': new Error('403'), 'orgs/Example/outside_collaborators': new Error('403'), 'orgs/Example': { plan: { name: 'free' }, default_repository_permission: 'none' } });
  const inv = inventory('Example', { api });
  assert.equal(inv.without2fa, null);
  assert.equal(inv.limitations.filter(line => line.includes('403')).length, 2);
  const found = gaps(inv);
  assert.deepEqual(codes(found), ['two-factor', 'unknown', 'unknown']);
  assert.match(found[0].detail, /unknown/);
});

test('unreadable team members are unknown and never make members look unplaced', () => {
  const { api } = fixture({ 'orgs/Example/teams/admin/members': new Error('403'), 'orgs/Example/teams/support/members': new Error('403') });
  assert.deepEqual(codes(gaps(inventory('Example', { api }))), ['unknown']);
});

test('without organization roles, per-repository grants are required', () => {
  const { api } = fixture({
    'orgs/Example/organization-roles': new Error('404 needs admin:org'),
    'orgs/Example/teams/admin/repos': [[{ name: 'app', role_name: 'admin' }]],
    'orgs/Example/teams/dev/repos': [[{ name: 'app', role_name: 'maintain' }]],
  });
  const found = gaps(inventory('Example', { api }));
  assert.deepEqual(codes(found), ['roles-unavailable', 'repo-grant', 'missing-repo-grant', 'missing-repo-grant']);
  assert.deepEqual(found.slice(2).map(gap => gap.detail), ['dev lacks write on app', 'support lacks triage on app']);
});

test('invalid organization names are rejected before any request', () => {
  const { api, calls } = fixture();
  assert.throws(() => inventory('bad/org', { api }), /Invalid organization/);
  assert.equal(calls.length, 0);
});
