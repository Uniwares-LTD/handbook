import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { inventory, preview, applyPlan, resolveRepository, defaults } from '../scripts/project-management.mjs';
import { closureDecision, reconcileStatus } from '../scripts/reconcile-status.mjs';
import { loadTracking, validateTracking } from '../scripts/tracking-config.mjs';
import { checkReadiness } from '../scripts/handbook-integration.mjs';
import { reconcile } from '../scripts/enroll.mjs';
import { previewIssue, applyIssue } from '../scripts/create-issue.mjs';

function fixture(org = 'Example', { empty = false } = {}) {
  const repository = `${org}/product`, writes = [];
  const config = { organization: org, title: 'Delivery', number: 7, url: `https://github.com/orgs/${org}/projects/7`, repositories: [repository], scope: 'repository' };
  const state = { id: 'P', number: 7, title: 'Delivery', url: config.url, public: false, closed: false, viewerCanUpdate: true, owner: { login: org }, fields: [], views: [], repositories: [], workflows: [], items: [] };
  let exists = !empty, failure, selected;
  const issue = { node_id: 'I', number: 1, title: 'Work', state: 'closed', state_reason: 'completed', closed_at: '2026-10-27T00:00:00Z' };
  const events = [{ id: 1, event: 'closed', actor: { type: 'User', login: 'member' }, created_at: issue.closed_at, commit_id: null }];
  const value = (q, key) => JSON.parse(q.match(new RegExp(`${key}:("(?:[^"\\\\]|\\\\.)*")`))[1]);
  const api = args => {
    if (!args.includes('graphql')) {
      const endpoint = args.at(-1);
      if (endpoint.endsWith('/events?per_page=100')) return [events];
      if (endpoint.endsWith('/issues/1')) return issue;
      if (endpoint.includes('/issues?')) return [[{ ...issue, assignees: [] }]];
      return { full_name: repository, node_id: 'R', owner: { type: 'Organization', login: org }, permissions: { push: true } };
    }
    const q = args.find(a => a.startsWith('query=')).slice(6);
    const result = data => ({ data: structuredClone(data) });
    if (q.startsWith('mutation')) {
      if (/createProjectV2Field|updateProjectV2Field/.test(q)) {
        assert(!/color\s*:\s*"/.test(q), 'GraphQL option colors must be enum literals');
        assert([...q.matchAll(/color:([A-Z]+)/g)].every(m => ['GRAY','BLUE','GREEN','YELLOW','ORANGE','RED','PINK','PURPLE'].includes(m[1])));
      }
      writes.push(q);
      if (failure) throw new Error(failure);
      if (q.includes('createProjectV2(input')) { exists = true; return result({ createProjectV2: { projectV2: state } }); }
      if (q.includes('linkProjectV2ToRepository')) { state.repositories.push({ id: 'R', nameWithOwner: repository }); return result({ linkProjectV2ToRepository: { repository: { id: 'R' } } }); }
      if (q.includes('createProjectV2Field')) {
        const name = value(q,'name');
        const options = [...q.matchAll(/\{name:("[^"\n]*"),color:/g)].map((m,i) => ({ id: `${name}${i}`, name: JSON.parse(m[1]), color: 'GRAY', description: '' }));
        state.fields.push({ id: `F${name}`, name, dataType: 'SINGLE_SELECT', options });
        return result({ createProjectV2Field: { projectV2Field: { id: `F${name}` } } });
      }
      if (q.includes('updateProjectV2Field')) {
        const field = state.fields.find(f => f.id === value(q,'fieldId'));
        const list = q.match(/singleSelectOptions:(\[[\s\S]*\])\}\)/)[1];
        field.options = JSON.parse(list.replace(/([,{])([A-Za-z]+):/g,'$1"$2":').replace(/"color":([A-Z]+)/g,'"color":"$1"')).map((o,i) => ({ id: `${field.id}${i}`, ...o }));
        return result({ updateProjectV2Field: { projectV2Field: { id: field.id } } });
      }
      if (q.includes('createProjectV2View')) {
        const view = { id: `V${state.views.length}`, number: state.views.length + 1, name: value(q,'name'), layout: q.match(/layout:(\w+)/)[1], filter: '' };
        state.views.push(view); return result({ createProjectV2View: { projectV2View: { id: view.id } } });
      }
      if (q.includes('updateProjectV2View')) {
        const view = state.views.find(v => v.id === value(q,'viewId'));
        Object.assign(view, { name: value(q,'name'), filter: value(q,'filter'), layout: q.match(/layout:(\w+)/)[1] });
        return result({ updateProjectV2View: { projectV2View: { id: view.id } } });
      }
      if (q.includes('addProjectV2ItemById')) { state.items.push({ id: 'ITEM', content: { id: 'I' } }); return result({ addProjectV2ItemById: { item: { id: 'ITEM' } } }); }
      if (q.includes('updateProjectV2ItemFieldValue')) { selected = value(q,'singleSelectOptionId'); return result({ updateProjectV2ItemFieldValue: { projectV2Item: { id: 'ITEM' } } }); }
      throw new Error('Unexpected mutation');
    }
    if (q.includes('fieldValueByName')) return result({ node: { fieldValueByName: { optionId: selected } } });
    if (q.includes('... on ProjectV2Item{project')) return result({node:{project:{id:'P'},content:{id:'I'}}});
    if (q.includes('projectsV2(')) return result({ organization: { projectsV2: { nodes: exists ? [{ id: 'P', number: 7, title: state.title, url: state.url, closed: false, viewerCanUpdate: true }] : [], pageInfo: { hasNextPage: false } } } });
    if (q.includes('projectV2(number:')) return result({ organization: { projectV2: { id: 'P' } } });
    if (q.includes('organization(login:$owner){id}')) return result({ organization: { id: 'ORG' } });
    const connection = ['fields','views','repositories','workflows','items'].find(key => q.includes(`${key}(first:`));
    if (connection) return result({ node: { ...state, [connection]: { nodes: state[connection], pageInfo: { hasNextPage: false } } } });
    return result({ node: state });
  };
  return { config, repository, api, writes, state, issue, events, fail: message => { failure = message; } };
}

test('two unrelated organizations inventory, preview and enroll without Uniwares fallback', () => {
  for (const org of ['Acme', 'Another-Team']) {
    const f = fixture(org);
    assert.equal(inventory({ repository: f.repository, api: f.api }).target.organization, org);
    assert(preview(f.config, f).operations.length);
    assert.equal(f.writes.length, 0);
    reconcile(f.config, { api: f.api, apply: [`${f.repository}#1`] });
    assert(!f.writes.join().includes('Uniwares'));
  }
});
test('identity resolution rejects ambiguous remotes, personal owners, transfers and foreign configuration', () => {
  const f = fixture();
  assert.throws(() => resolveRepository({ remotes: ['https://github.com/Example/product.git', 'git@github.com:Other/fork.git'], api: f.api }), /Ambiguous/);
  assert.equal(resolveRepository({ remotes: ['git@github.com:Example/product.git'], api: f.api }).repository, f.repository);
  assert.throws(() => resolveRepository({ repository: f.repository, api: () => ({ owner: { type: 'User' } }) }), /Personal/);
  assert.throws(() => resolveRepository({ repository: 'Other/repo', api: f.api }), /identity/);
  assert.throws(() => preview({ ...f.config, organization: 'Other' }, f), /organization/);
});
test('inventory pagination and access failures distinguish unavailable from empty', () => {
  const f = fixture(); let calls = 0;
  const api = args => {
    if (args.some(a => a.includes('projectsV2('))) { calls++; return { data: { organization: { projectsV2: { nodes: [{ id: `P${calls}` }], pageInfo: { hasNextPage: calls === 1, endCursor: 'next' } } } } }; }
    return f.api(args);
  };
  assert.equal(inventory({ repository: f.repository, api }).projects.length, 2);
  const denied = args => args.some(a => a.includes('projectsV2(')) ? (() => { throw new Error('read:project missing'); })() : f.api(args);
  assert.match(inventory({ repository: f.repository, api: denied }).limitations[0], /not an empty inventory/);
  assert.throws(() => preview(f.config, { ...f, api: denied }), /unavailable/);
  const unsupported = args => args.some(a => a.includes('workflows(first:')) ? { errors: [{ message: 'unsupported' }] } : f.api(args);
  assert.throws(() => preview(f.config, { ...f, api: unsupported }), /incomplete/);
});
test('detailed inventory reports readiness gaps without certifying prose or writing', () => {
  const f = fixture();
  f.state.items = [{ id: 'ITEM', content: { state: 'OPEN', number: 1, repository: { nameWithOwner: f.repository }, assignees: { nodes: [] } } }];
  const api = args => args.some(a => a.includes('priority:fieldValueByName')) ? { data: { node: { priority: null, blocked: null } } } : f.api(args);
  const result = inventory({ ...f, api, details: true });
  const gaps = result.projects[0].readiness[0].gaps.join(';');
  assert.match(gaps, /Priority missing/);
  assert.match(gaps, /Blocker decision missing/);
  assert.match(gaps, /Accountable owner missing/);
  assert.match(gaps, /issue prose/);
  assert.equal(f.writes.length, 0);
});
test('preview/apply readback, idempotence and option identity preservation', () => {
  const f = fixture();
  f.state.fields.push({ id: 'S', name: 'Status', dataType: 'SINGLE_SELECT', options: [{ id: 'custom', name: 'Custom', color: 'BLUE', description: 'Keep' }] });
  const plan = preview(f.config, f);
  assert.equal(f.writes.length, 0);
  const result = applyPlan(plan, f);
  assert.equal(result.complete, false); // browser grouping/workflow checks remain explicit
  assert.deepEqual(f.state.fields[0].options[0], { id: 'custom', name: 'Custom', color: 'BLUE', description: 'Keep' });
  assert.deepEqual(preview(f.config, f).operations, []);
  const count = f.writes.length;
  applyPlan(preview(f.config, f), f);
  assert.equal(f.writes.length, count);
});
test('custom views are conflicts, stale previews do not write, partial failures are explicit', () => {
  const f = fixture();
  f.state.views.push({ id: 'V', number: 1, name: 'My items', filter: 'label:custom', layout: 'TABLE_LAYOUT' });
  assert.match(preview(f.config, f).conflicts[0], /customized/);
  f.state.views = [];
  const plan = preview(f.config, f);
  f.state.title = 'Renamed';
  assert.throws(() => applyPlan(plan, f), /stale/);
  assert.equal(f.writes.length, 0);
  f.fail('network outcome unknown');
  assert.throws(() => applyPlan(preview(f.config, f), f), /Partial result.*inspect|Partial result/is);
});
test('creation uses chosen organization, duplicate titles require explicit selection', () => {
  const f = fixture('Acme', { empty: true });
  const config = { ...f.config }; delete config.number; delete config.url;
  applyPlan(preview(config, f), f);
  assert(f.writes[0].includes('ownerId:"ORG"'));
  assert.throws(() => preview(config, f), /title exists/);
});
test('new project default Status keeps option IDs and serializes colors as enums', () => {
  const f = fixture('Acme', { empty: true });
  f.state.fields.push({ id: 'S', name: 'Status', dataType: 'SINGLE_SELECT', options: [{ id: 'todo', name: 'To do', color: 'BLUE', description: 'Keep "quoted" text' }] });
  const config = { ...f.config }; delete config.number; delete config.url;
  applyPlan(preview(config, f), f);
  assert.equal(f.state.fields[0].options[0].id, 'todo');
  assert.equal(f.state.fields[0].options[0].description, 'Keep "quoted" text');
  const update = f.writes.find(q => q.includes('updateProjectV2Field'));
  assert.match(update, /color:BLUE/);
  assert.match(update, /color:GRAY/);
  assert(f.writes.some(q => q.includes('createProjectV2Field') && q.includes('color:GRAY')));
});
test('consumer-relative configuration never loads source project; offline warnings remain advisory', t => {
  const root = mkdtempSync(path.join(tmpdir(), 'tracking-')); t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.throws(() => loadTracking(root), /No consumer tracking/);
  writeFileSync(path.join(root, 'handbook.json'), JSON.stringify({ version: 1, kind: 'consumer', technologySkills: [], tracking: 'tracking.json' }));
  writeFileSync(path.join(root, 'tracking.json'), JSON.stringify(fixture().config));
  assert.equal(loadTracking(root).organization, 'Example');
  assert.throws(() => loadTracking(root, '../project.json'), /inside/);
  assert(!checkReadiness(root).warnings.some(w => w.startsWith('tracking:')));
  writeFileSync(path.join(root, 'tracking.json'), '{broken');
  assert(checkReadiness(root).warnings.some(w => w.startsWith('tracking:')));
  assert.throws(() => validateTracking({ ...fixture().config, provider: 'linear' }), /Unsupported/);
});
test('closure mirrors only confirmed latest human decision and never changes issue state', () => {
  const f = fixture();
  const evidence = { eventId: 1, actor: 'member', decisionReference: 'Human acceptance in session' };
  assert.equal(closureDecision(f.issue, f.events, evidence).status, 'Done');
  assert.equal(closureDecision({ ...f.issue, state_reason: 'not_planned' }, f.events, evidence).status, 'Cancelled');
  for (const issue of [{ ...f.issue, state: 'open' }, { ...f.issue, state_reason: null }]) assert(!closureDecision(issue, f.events, evidence).eligible);
  assert(!closureDecision(f.issue, f.events).eligible);
  assert(!closureDecision(f.issue, [{ ...f.events[0], actor: { type: 'Bot', login: 'bot' } }], evidence).eligible);
  assert(!closureDecision(f.issue, [{ ...f.events[0], commit_id: 'merge' }], evidence).eligible);
  f.state.fields.push({ id: 'S', name: 'Status', dataType: 'SINGLE_SELECT', options: [{ id: 'done', name: 'Done' }, { id: 'cancel', name: 'Cancelled' }] });
  f.state.items.push({ id: 'ITEM', content: { id: 'I' } });
  const args = { api: f.api, references: [`${f.repository}#1`], evidence: { [`${f.repository}#1`]: evidence } };
  reconcileStatus(f.config, args); assert.equal(f.writes.length, 0);
  reconcileStatus(f.config, { ...args, apply: true });
  assert(f.writes.every(q => q.includes('updateProjectV2ItemFieldValue')));
  const count = f.writes.length;
  reconcileStatus(f.config, { ...args, apply: true }); assert.equal(f.writes.length, count);
  f.issue.state = 'open';
  assert.throws(() => reconcileStatus(f.config, { ...args, apply: true }), /no writes/);
});
function issueFixture({ duplicates = [], recent = [], autoAdded = false, failEnroll = false, failField = false } = {}) {
  const f = fixture();
  f.state.fields.push(
    { id: 'S', name: 'Status', dataType: 'SINGLE_SELECT', options: ['Backlog', 'Ready', 'In progress', 'In review', 'Done', 'Cancelled'].map(name => ({ id: `s-${name}`, name })) },
    { id: 'B', name: 'Blocked', dataType: 'SINGLE_SELECT', options: [{ id: 'b-no', name: 'Not blocked' }, { id: 'b-yes', name: 'Blocked' }] });
  const values = {}, creates = [], adds = [], searches = [], sets = [], queries = [];
  const created = { number: 9, node_id: 'I', title: 'Review guidance', html_url: 'https://github.com/Example/product/issues/9', labels: [{ name: 'documentation' }], type: { name: 'Task' } };
  const variable = (args, key) => args.find(a => a.startsWith(`${key}=`))?.slice(key.length + 1);
  const api = args => {
    const endpoint = args.find(a => a.startsWith('repos/') || a === 'search/issues');
    if (endpoint === 'search/issues') { searches.push(variable(args, 'q')); return [{ items: duplicates, total_count: duplicates.length, incomplete_results: false }]; }
    if (endpoint?.includes('/issues?state=all')) return recent;
    if (endpoint?.endsWith('/issues/9')) return created;
    if (endpoint?.endsWith('/labels?per_page=100')) return [[{ name: 'documentation' }]];
    if (endpoint?.endsWith('/issues') && args.includes('POST')) {
      creates.push(args);
      if (autoAdded) values.Status = autoAdded;
      return created;
    }
    const q = variable(args, 'query') ?? '';
    queries.push(q);
    if (q.includes('issueTypes')) return { data: { repository: { issueTypes: { nodes: [{ name: 'Task' }, { name: 'Bug' }] } } } };
    if (q.includes('fieldValueByName')) {
      const name = variable(args, 'name');
      return { data: { node: { fieldValueByName: values[name] ? { optionId: values[name] } : null } } };
    }
    if (q.includes('addProjectV2ItemById')) { adds.push(q); if (failEnroll) throw new Error('network outcome unknown'); }
    if (q.includes('updateProjectV2ItemFieldValue')) {
      if (failField) throw new Error('field write failed');
      const field = variable(args, 'field'); sets.push(field);
      values[field === 'S' ? 'Status' : 'Blocked'] = variable(args, 'option');
      return { data: { updateProjectV2ItemFieldValue: { projectV2Item: { id: 'ITEM' } } } };
    }
    return f.api(args);
  };
  const spec = { repository: f.repository, title: 'Review guidance', body: 'Outcome, scope and acceptance.', type: 'Task', labels: ['documentation'], blocked: 'Not blocked' };
  return { ...f, api, spec, values, creates, adds, searches, sets, queries, created };
}
const approve = (f, spec = f.spec) => previewIssue(f.config, spec, f).fingerprint;
test('issue preview validates the spec against tracking and the project without writing or reading items', () => {
  const f = issueFixture({ duplicates: [{ number: 3, title: 'Review guidance docs', state: 'open', html_url: 'u' }] });
  const result = previewIssue(f.config, f.spec, f);
  assert.deepEqual(result.unreviewedDuplicates, [3]);
  assert.equal(f.writes.length, 0);
  assert(!f.queries.some(q => q.includes('items(first:')));
  assert.throws(() => previewIssue(f.config, { ...f.spec, repository: 'Example/other' }, f), /not in the tracking selection/);
  assert.throws(() => previewIssue(f.config, { ...f.spec, blocked: 'Maybe' }, f), /Missing Blocked option/);
  assert.throws(() => previewIssue(f.config, { ...f.spec, labels: ['nope'] }, f), /Unknown labels/);
  assert.throws(() => previewIssue(f.config, { ...f.spec, type: 'Feature' }, f), /type unavailable/);
  assert.throws(() => applyIssue(f.config, f.spec, { ...f, expect: result.fingerprint }), /Unreviewed duplicate/);
  assert.equal(f.creates.length, 0);
});
test('duplicate search uses plain words, paginates and refuses incomplete results', () => {
  const f = issueFixture();
  previewIssue(f.config, { ...f.spec, title: 'Remove -legacy flag (OR "fast": path)' }, f);
  assert.equal(f.searches.at(-1), `repo:${f.repository} is:issue in:title Remove legacy flag fast path`);
  const pages = [{ items: [{ number: 1, title: 'a' }], total_count: 2 }, { items: [{ number: 12, title: 'b' }], total_count: 2 }];
  const paged = args => args.includes('search/issues') ? (assert(args.includes('--paginate')), pages) : f.api(args);
  assert.deepEqual(previewIssue(f.config, f.spec, { api: paged }).unreviewedDuplicates, [1, 12]);
  const partial = args => args.includes('search/issues') ? [{ items: [], total_count: 5, incomplete_results: true }] : f.api(args);
  assert.throws(() => previewIssue(f.config, f.spec, { api: partial }), /incomplete/);
});
test('approved issue is created once, added to the project and given Backlog and Blocked', () => {
  const f = issueFixture();
  const fingerprint = approve(f);
  assert.throws(() => applyIssue(f.config, { ...f.spec, title: 'Edited after approval' }, { ...f, expect: fingerprint }), /changed since the approved preview/);
  assert.equal(f.creates.length, 0);
  const result = applyIssue(f.config, f.spec, { ...f, expect: fingerprint });
  assert.deepEqual([result.reference, result.status, result.blocked], [`${f.repository}#9`, 'Backlog', 'Not blocked']);
  assert.equal(f.creates.length, 1);
  assert(f.creates[0].includes('type=Task') && f.creates[0].includes('labels[]=documentation'));
  assert.deepEqual(f.values, { Status: 's-Backlog', Blocked: 'b-no' });
  assert.deepEqual(result.warnings, []);
  const dropped = issueFixture();
  Object.assign(dropped.created, { labels: [], type: null });
  const partial = applyIssue(dropped.config, dropped.spec, { ...dropped, expect: approve(dropped) });
  assert.equal(dropped.creates.length, 1);
  assert.match(partial.warnings.join(' '), /did not apply labels: documentation.*did not apply type Task/s);
});
test('auto-added issue keeps workflow Status and reports its option name', () => {
  const f = issueFixture({ autoAdded: 's-Ready' });
  const result = applyIssue(f.config, f.spec, { ...f, expect: approve(f) });
  assert.equal(result.status, 'Ready');
  assert.deepEqual(f.sets, ['B']);
});
test('tracking failure after creation is resumed without creating again', () => {
  const failing = issueFixture({ failField: true });
  assert.throws(() => applyIssue(failing.config, failing.spec, { ...failing, expect: approve(failing) }),
    /Example\/product#9 exists.*after \[enrolled\].*same --spec and --config plus --resume 9/s);
  assert.equal(failing.creates.length, 1);
  const f = issueFixture();
  const result = applyIssue(f.config, f.spec, { ...f, resume: 9 });
  assert.deepEqual([result.reference, result.status, f.creates.length], [`${f.repository}#9`, 'Backlog', 0]);
  assert.throws(() => applyIssue(f.config, { ...f.spec, title: 'Other work' }, { ...f, resume: 9 }), /does not match this spec/);
});
test('uncertain creation is caught by the consistent exact-title check, not search', () => {
  const f = issueFixture();
  const expect = approve(f);
  const api = args => args.includes('POST') ? (() => { throw new Error('TLS handshake timeout'); })() : f.api(args);
  assert.throws(() => applyIssue(f.config, f.spec, { api, expect }), /outcome unknown.*Do not rerun --apply.*--resume/s);
  assert.equal(f.adds.length, 0);
  // GitHub created it and search has not indexed it yet; the recent list already shows it.
  const after = issueFixture({ recent: [{ number: 9, title: ' review  GUIDANCE ', state: 'open', html_url: 'u' }] });
  assert.deepEqual(previewIssue(after.config, after.spec, after).unreviewedDuplicates, [9]);
});
