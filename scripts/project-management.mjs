// Run from the consumer, including when this file comes from a committed snapshot.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ghJson, graph } from './enroll.mjs';
import { loadTracking, validateTracking, repositoryPattern, stages } from './tracking-config.mjs';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const pageInfo = 'pageInfo{hasNextPage endCursor}';
function pages(fetch) {
  const result = [], seen = new Set();
  let cursor;
  do {
    const page = fetch(cursor);
    if (!page || !Array.isArray(page.nodes) || !page.pageInfo) throw new Error('Incomplete inventory response.');
    result.push(...page.nodes);
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : undefined;
    if (page.pageInfo.hasNextPage && (!cursor || seen.has(cursor))) throw new Error('Incomplete or repeated pagination cursor.');
    seen.add(cursor);
  } while (cursor);
  return result;
}
export function resolveRepository({ root = process.cwd(), repository, remotes, api = ghJson } = {}) {
  if (!repository) {
    const values = remotes ?? execFileSync('git', ['remote', '-v'], { cwd: root, encoding: 'utf8', windowsHide: true }).split('\n').filter(line => line.endsWith('(fetch)')).map(line => line.split(/\s+/)[1]);
    const matches = [...new Set(values.map(url => url.match(/^(?:https:\/\/github\.com\/|git@github\.com:)([^/]+\/[^/]+?)(?:\.git)?$/)?.[1]).filter(Boolean))];
    if (matches.length !== 1) throw new Error('Ambiguous or unsupported Git remotes. Supply --repo OWNER/REPO; never infer from the authenticated account or fork upstream.');
    repository = matches[0];
  }
  if (!repositoryPattern.test(repository)) throw new Error('Invalid repository reference.');
  const found = api(['api', `repos/${repository}`]);
  if (found.owner?.type !== 'Organization') throw new Error('Personal-account repositories are recognized but unsupported; preserve existing tracking.');
  if (found.full_name?.toLowerCase() !== repository.toLowerCase() || !found.node_id) throw new Error('Repository identity changed or is inaccessible; reconcile before setup.');
  return { repository: found.full_name, organization: found.owner.login, id: found.node_id, permissions: found.permissions ?? null, fork: Boolean(found.fork) };
}
export function projectState(id, api = ghJson) {
  const state = graph(api, 'query($id:ID!){node(id:$id){... on ProjectV2{id number title url public closed viewerCanUpdate owner{... on Organization{login}}}}}', { id }).node;
  if (!state?.owner?.login) throw new Error('Selected project is inaccessible or not organization-owned.');
  const selections = {
    fields: '... on ProjectV2Field{id name dataType} ... on ProjectV2SingleSelectField{id name dataType options{id name color description}} ... on ProjectV2IterationField{id name dataType}',
    views: 'id name number layout filter',
    repositories: 'id nameWithOwner',
    workflows: 'id name enabled',
    items: 'id content{... on Issue{id number title state stateReason body repository{nameWithOwner} assignees(first:2){nodes{login}}}}',
  };
  const limitations = [];
  for (const [key, selection] of Object.entries(selections)) {
    try { state[key] = pages(cursor => graph(api, `query($id:ID!,$cursor:String){node(id:$id){... on ProjectV2{${key}(first:100,after:$cursor){nodes{${selection}} ${pageInfo}}}}}`, { id, cursor }).node?.[key]); }
    catch (error) { state[key] = null; limitations.push(`${key}: ${error.message}`); }
  }
  return { ...state, limitations };
}
export function inventory(options = {}) {
  const api = options.api ?? ghJson, target = resolveRepository({ ...options, api });
  const result = { target, projects: [], limitations: [], visibility: 'accessible-only; hidden projects cannot be ruled out' };
  try {
    result.projects = pages(cursor => graph(api, `query($owner:String!,$cursor:String){organization(login:$owner){projectsV2(first:100,after:$cursor){nodes{id number title url closed viewerCanUpdate} ${pageInfo}}}}`, { owner: target.organization, cursor }).organization?.projectsV2);
  } catch (error) { result.limitations.push(`Projects unavailable (not an empty inventory): ${error.message}`); }
  if (options.details) result.projects = result.projects.map(p => {
    const state = projectState(p.id, api);
    state.readiness = [];
    for (const item of state.items ?? []) {
      if (item.content?.state !== 'OPEN') continue;
      const gaps = ['Confirm bounded scope, acceptance criteria and one accountable human in issue prose'];
      if (!item.content.assignees?.nodes?.length) gaps.push('Accountable owner missing');
      try {
        const names = options.config?.fieldNames ?? {};
        const values = graph(api, 'query($id:ID!,$priority:String!,$blocked:String!){node(id:$id){... on ProjectV2Item{priority:fieldValueByName(name:$priority){... on ProjectV2ItemFieldSingleSelectValue{name}} blocked:fieldValueByName(name:$blocked){... on ProjectV2ItemFieldSingleSelectValue{name}}}}}', { id: item.id, priority: names.priority ?? 'Priority', blocked: names.blocked ?? 'Blocked' }).node;
        if (!values || !Object.hasOwn(values, 'priority') || !Object.hasOwn(values, 'blocked')) throw new Error('Incomplete field values');
        if (!values.priority?.name) gaps.push('Priority missing or unsupported mapping');
        if (!values.blocked?.name) gaps.push('Blocker decision missing or unsupported mapping');
        if (values.blocked?.name === 'Blocked') gaps.push('Verify blocker reason, responsible person and next action in issue');
      } catch (error) { gaps.push(`Priority/blocker visibility incomplete: ${error.message}`); }
      state.readiness.push({ itemId: item.id, repository: item.content.repository?.nameWithOwner, number: item.content.number, gaps });
    }
    return state;
  });
  // Relevant queue, not an automatic enrollment list. Preserve documentation/legacy queues too.
  try {
    const queue = api(['api', '--paginate', '--slurp', `repos/${target.repository}/issues?state=open&per_page=100`]);
    if (!Array.isArray(queue) || !queue.every(Array.isArray)) throw new Error('Incomplete issue pages.');
    result.openIssues = queue.flat().filter(i => !i.pull_request).map(i => ({ number: i.number, title: i.title, assignees: i.assignees?.map(a => a.login) ?? [], readiness: ['Scope and acceptance require prose review', ...(!i.assignees?.length ? ['Accountable owner missing'] : [])] }));
  } catch (error) { result.openIssues = null; result.limitations.push(`Queue unavailable: ${error.message}`); }
  return result;
}
export function defaults(config) {
  const names = config.fieldNames ?? {}, status = config.statuses ?? Object.fromEntries(stages.map(n => [n, n]));
  const qualifier = name => name.toLowerCase().replace(/\s+/g, '-');
  const fields = [
    { name: names.status ?? 'Status', dataType: 'SINGLE_SELECT', options: stages.map(n => status[n]) },
    { name: names.priority ?? 'Priority', dataType: 'SINGLE_SELECT', options: ['P0', 'P1', 'P2', 'P3'] },
    { name: names.blocked ?? 'Blocked', dataType: 'SINGLE_SELECT', options: ['Not blocked', 'Blocked'] },
  ];
  // All open work remains visible, including untriaged rows with unset fields.
  const views = [
    { name: 'Active work', layout: 'BOARD_LAYOUT', filter: 'is:issue is:open' },
    { name: 'Triage', layout: 'TABLE_LAYOUT', filter: `is:issue is:open -${qualifier(fields[0].name)}:${JSON.stringify(status.Ready)},${JSON.stringify(status['In progress'])},${JSON.stringify(status['In review'])}` },
    { name: 'My items', layout: 'TABLE_LAYOUT', filter: 'is:issue is:open assignee:@me' },
    { name: 'Blocked', layout: 'TABLE_LAYOUT', filter: `is:issue is:open ${qualifier(fields[2].name)}:Blocked` },
    { name: 'Review', layout: 'TABLE_LAYOUT', filter: `is:issue is:open ${qualifier(fields[0].name)}:${JSON.stringify(status['In review'])}` },
    { name: 'History', layout: 'TABLE_LAYOUT', filter: 'is:issue is:closed' },
  ];
  if (config.scope === 'organization') views.push({ name: 'By repository', layout: 'TABLE_LAYOUT', filter: 'is:issue is:open' });
  return { fields, views };
}
export function preview(config, options = {}) {
  validateTracking(config);
  const api = options.api ?? ghJson, inv = inventory({ ...options, api });
  if (inv.target.organization.toLowerCase() !== config.organization.toLowerCase() || !config.repositories.some(r => r.toLowerCase() === inv.target.repository.toLowerCase())) throw new Error('Consumer repository is not included in the selected organization/project configuration.');
  if (inv.limitations.length) throw new Error(inv.limitations.join('\n'));
  const selected = config.number ? inv.projects.find(p => p.number === config.number) : null;
  if (config.number && (!selected || (config.id && config.id !== selected.id))) throw new Error('Configured project identity is inaccessible or changed.');
  if (!selected && inv.projects.some(p => p.title === config.title)) throw new Error('A project with this title exists; explicitly select it or choose a distinct title before creating.');
  const current = selected ? projectState(selected.id, api) : null;
  if (current && (current.closed || current.limitations.length)) throw new Error('Project is closed or inventory incomplete; reconcile before applying.');
  const repositories = config.repositories.map(repository => resolveRepository({ repository, api }));
  const operations = [], conflicts = [], desired = defaults(config);
  if (!current) operations.push({ kind: 'create-project', title: config.title });
  for (const repository of repositories) if (!current?.repositories.some(r => r.id === repository.id)) operations.push({ kind: 'link-repository', repository: repository.repository, id: repository.id });
  for (const field of desired.fields) {
    const matches = current?.fields.filter(f => f.name === field.name) ?? [];
    if (matches.length > 1 || (matches[0] && matches[0].dataType !== field.dataType)) { conflicts.push(`Ambiguous or incompatible field: ${field.name}`); continue; }
    const found = matches[0];
    if (!found) operations.push({ kind: 'create-field', ...field });
    else {
      const missing = field.options.filter(n => !found.options.some(o => o.name === n));
      if (missing.length) operations.push({ kind: 'extend-field', id: found.id, name: field.name, options: found.options, add: missing });
    }
  }
  for (const view of desired.views) {
    const matches = current?.views.filter(v => v.name === view.name) ?? [];
    if (matches.length > 1) { conflicts.push(`Ambiguous view: ${view.name}`); continue; }
    const found = matches[0];
    if (!found) operations.push({ kind: 'create-view', ...view });
    else if (found.layout !== view.layout || found.filter !== view.filter) {
      if (config.managedViews?.includes(view.name)) operations.push({ kind: 'update-view', id: found.id, before: found, ...view });
      else conflicts.push(`Preserved customized view: ${view.name}; explicitly list it in managedViews only after reviewing its replacement.`);
    }
  }
  return { version: 1, config, repository: inv.target.repository, fingerprint: hash({ target: inv.target, projects: inv.projects, current, repositories }), operations, conflicts,
    permissions: { projectWrite: current?.viewerCanUpdate ?? 'creation capability must be verified by GitHub', repositoryPermissions: inv.target.permissions },
    manual: ['Review existing workflow semantics in GitHub: disable unconditional closed-to-Done and all independent acceptance automation; retain added/reopened-to-Backlog where appropriate.', 'Set Active work as the default view, group its board by status and By repository by repository; display closure reason in History. API does not expose all grouping/default/workflow settings.', 'Review scope/acceptance prose and legacy queues; Triage filters alone cannot certify readiness.'] };
}
const optionColors = new Set(['GRAY', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'RED', 'PINK', 'PURPLE']);
function gql(value, key) {
  if (key === 'color') {
    if (!optionColors.has(value)) throw new Error(`Unsupported option color: ${value}`);
    return value; // ProjectV2SingleSelectFieldOptionColor is an enum, not a string.
  }
  if (Array.isArray(value)) return `[${value.map(v => gql(v)).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).filter(([,v]) => v !== undefined).map(([k,v]) => `${k}:${gql(v, k)}`).join(',')}}`;
  return JSON.stringify(value);
}
function mutation(api, name, input, selection) {
  return graph(api, `mutation{${name}(input:${gql(input)}){${selection}}}`)[name];
}
export function applyPlan(plan, { api = ghJson, log = () => {} } = {}) {
  const fresh = preview(plan.config, { repository: plan.repository, api });
  if (fresh.conflicts.length) throw new Error(fresh.conflicts.join('\n'));
  if (hash(fresh) !== hash(plan)) throw new Error('Preview is stale or modified; inventory and preview again before applying.');
  if (fresh.permissions.projectWrite === false) throw new Error('Project write access unavailable; do not expand credential scopes automatically.');
  let project = plan.config.number ? inventory({ repository: plan.repository, api }).projects.find(p => p.number === plan.config.number) : null;
  const completed = [];
  try {
    for (const op of plan.operations) {
      // Re-read before each write. Stop on concurrent changes; never overwrite them.
      let state = project ? projectState(project.id, api) : null;
      if (state?.limitations.length) throw new Error('Readback incomplete.');
      if (state && (state.closed || !state.viewerCanUpdate || state.owner.login.toLowerCase() !== plan.config.organization.toLowerCase())) throw new Error('Project identity, state or write permission changed; reconcile.');
      if (op.kind === 'create-project') {
        const inv = inventory({ repository: plan.repository, api });
        if (inv.limitations.length || inv.projects.some(p => p.title === op.title)) throw new Error('Creation outcome/destination changed; select the existing project explicitly before retrying.');
        const owner = graph(api, 'query($owner:String!){organization(login:$owner){id}}', { owner: plan.config.organization }).organization?.id;
        if (!owner) throw new Error('Organization unavailable.');
        project = mutation(api, 'createProjectV2', { ownerId: owner, title: op.title }, 'projectV2{id number url}')?.projectV2;
        if (!project?.id) throw new Error('Creation outcome uncertain; inventory before retrying.');
        log({ createdProject: project });
        state = projectState(project.id, api);
        if (state.public) throw new Error('New project visibility differs from private default; inspect before continuing.');
      } else if (op.kind === 'link-repository') {
        if (!state.repositories.some(r => r.id === op.id)) mutation(api, 'linkProjectV2ToRepository', { projectId: project.id, repositoryId: op.id }, 'repository{id}');
      } else if (op.kind === 'create-field') {
        const existing = state.fields.find(f => f.name === op.name);
        // GitHub creates Status with a new project. Extend its defaults, preserving IDs.
        if (existing && plan.operations[0]?.kind !== 'create-project') throw new Error('Field appeared after preview; reconcile.');
        const options = op.options.map(name => ({ name, color: 'GRAY', description: '' }));
        if (existing) {
          if (existing.dataType !== op.dataType) throw new Error('Incompatible default field.');
          mutation(api, 'updateProjectV2Field', { fieldId: existing.id, singleSelectOptions: [...existing.options, ...options.filter(o => !existing.options.some(e => e.name === o.name))] }, 'projectV2Field{... on ProjectV2SingleSelectField{id}}');
        } else {
          // Enum values must be unquoted in GraphQL input.
          const input = gql({ projectId: project.id, name: op.name, singleSelectOptions: options });
          graph(api, `mutation{createProjectV2Field(input:${input.slice(0,-1)},dataType:SINGLE_SELECT}){projectV2Field{... on ProjectV2SingleSelectField{id}}}}`);
        }
      } else if (op.kind === 'extend-field') {
        const existing = state.fields.find(f => f.id === op.id);
        if (hash(existing?.options) !== hash(op.options)) throw new Error('Field options changed after preview; preserve them and re-preview.');
        mutation(api, 'updateProjectV2Field', { fieldId: op.id, singleSelectOptions: [...op.options, ...op.add.map(name => ({ name, color: 'GRAY', description: '' }))] }, 'projectV2Field{... on ProjectV2SingleSelectField{id}}');
      } else if (op.kind === 'create-view' || op.kind === 'update-view') {
        let id = op.id;
        if (id) {
          if (hash(state.views.find(v => v.id === id)) !== hash(op.before)) throw new Error('View changed after preview; reconcile.');
        } else {
          if (state.views.some(v => v.name === op.name)) throw new Error('View appeared after preview; reconcile.');
          id = graph(api, `mutation{createProjectV2View(input:{projectId:${gql(project.id)},name:${gql(op.name)},layout:${op.layout}}){projectV2View{id}}}`).createProjectV2View?.projectV2View?.id;
          if (!id) throw new Error('View creation outcome uncertain.');
        }
        const input = gql({ viewId: id, name: op.name, filter: op.filter });
        graph(api, `mutation{updateProjectV2View(input:${input.slice(0,-1)},layout:${op.layout}}){projectV2View{id}}}`);
      }
      const after = projectState(project.id, api);
      if (after.limitations.length || after.owner.login.toLowerCase() !== plan.config.organization.toLowerCase()) throw new Error('Readback unavailable or identity changed.');
      if (op.kind === 'link-repository' && !after.repositories.some(r => r.id === op.id)) throw new Error('Repository link readback mismatch.');
      if (op.kind.includes('field')) {
        const field = after.fields.find(f => f.name === op.name), names = op.kind === 'extend-field' ? op.add : op.options;
        if (!names.every(n => field?.options?.some(o => o.name === n))) throw new Error('Field readback mismatch.');
      }
      if (op.kind.includes('view') && !after.views.some(v => v.name === op.name && v.layout === op.layout && v.filter === op.filter)) throw new Error('View readback mismatch.');
      completed.push(op); log({ completed: op.kind, name: op.name ?? op.repository ?? op.title });
    }
  } catch (error) { throw new Error(`${error.message}\nPartial result: ${JSON.stringify({ project, completed })}. Inspect remote state and generate a fresh preview; do not blindly replay.`); }
  return { project, completed, manual: plan.manual, complete: false, reason: 'API changes verified; manual workflow/grouping/default-view verification still required.' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, ...args] = process.argv.slice(2), options = {};
    for (let i = 0; i < args.length; i += 2) {
      if (!['--root', '--repo', '--config', '--plan'].includes(args[i]) || !args[i+1]) throw new Error('Use inventory|preview|apply with --root PATH, --repo OWNER/REPO, --config RELATIVE or --plan FILE.');
      options[args[i].slice(2)] = args[i+1];
    }
    const root = path.resolve(options.root ?? process.cwd());
    const result = command === 'inventory' ? inventory({ root, repository: options.repo, details: true, config: options.config ? loadTracking(root, options.config) : undefined }) : command === 'preview' ? preview(loadTracking(root, options.config), { root, repository: options.repo }) : command === 'apply' && options.plan ? applyPlan(JSON.parse(readFileSync(options.plan, 'utf8')), { log: value => console.error(JSON.stringify(value)) }) : (() => { throw new Error('Choose inventory, preview, or apply --plan FILE after authorization.'); })();
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
