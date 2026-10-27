// Create one human-approved issue and add it to the consumer's recorded tracking project.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ghJson, graph, projectIdOf, enrollItem, readSingleSelect, setSingleSelect } from './enroll.mjs';
import { loadTracking, validateTracking } from './tracking-config.mjs';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const types = ['Task', 'Bug', 'Feature'];
const normalTitle = title => title.trim().replace(/\s+/g, ' ').toLowerCase();
function validateSpec(config, spec) {
  if (!spec || typeof spec !== 'object') throw new Error('Provide an issue spec object.');
  if (!config.repositories.includes(spec.repository)) throw new Error(`Repository is not in the tracking selection: ${spec.repository}`);
  if (typeof spec.title !== 'string' || !spec.title.trim() || spec.title.length > 256) throw new Error('Provide a title of 1-256 characters.');
  if (typeof spec.body !== 'string' || !spec.body.trim()) throw new Error('Provide an issue body with outcome, scope and acceptance.');
  if (spec.type !== undefined && !types.includes(spec.type)) throw new Error('Type must be Task, Bug or Feature.');
  if (spec.labels !== undefined && (!Array.isArray(spec.labels) || spec.labels.some(l => typeof l !== 'string' || !l))) throw new Error('Labels must be an array of names.');
  if (typeof spec.blocked !== 'string' || !spec.blocked) throw new Error('Set blocked explicitly to a Blocked field option.');
  if (spec.reviewedDuplicates !== undefined && (!Array.isArray(spec.reviewedDuplicates) || spec.reviewedDuplicates.some(n => !Number.isSafeInteger(n)))) throw new Error('reviewedDuplicates must list issue numbers.');
}
// Only identity, permission and fields are needed; project items are never read.
function projectFields(config, api) {
  const id = projectIdOf(config, api), fields = [];
  let project, cursor;
  do {
    project = graph(api, 'query($id:ID!,$cursor:String){node(id:$id){... on ProjectV2{url viewerCanUpdate owner{... on Organization{login}} fields(first:100,after:$cursor){nodes{... on ProjectV2SingleSelectField{id name dataType options{id name}}} pageInfo{hasNextPage endCursor}}}}}', { id, cursor }).node;
    if (!project?.fields?.pageInfo) throw new Error('Selected project fields are unavailable.');
    fields.push(...project.fields.nodes.filter(f => f?.id));
    cursor = project.fields.pageInfo.hasNextPage ? project.fields.pageInfo.endCursor : undefined;
  } while (cursor);
  if (project.owner?.login?.toLowerCase() !== config.organization.toLowerCase()) throw new Error('Selected project belongs to another organization.');
  if (!project.viewerCanUpdate) throw new Error('Project write permission unavailable; no issue will be created.');
  const select = name => {
    const found = fields.filter(f => f.name === name);
    if (found.length !== 1 || found[0].dataType !== 'SINGLE_SELECT') throw new Error(`Field mapping is missing or ambiguous: ${name}`);
    return found[0];
  };
  return { id, url: project.url, status: select(config.fieldNames?.status ?? 'Status'), blocked: select(config.fieldNames?.blocked ?? 'Blocked') };
}
function trackingPlan(config, spec, api) {
  validateTracking(config);
  validateSpec(config, spec);
  const project = projectFields(config, api);
  const option = (field, name) => field.options.find(o => o.name === name)?.id ?? (() => { throw new Error(`Missing ${field.name} option: ${name}`); })();
  return { projectId: project.id, project: project.url,
    statusField: project.status.id, statusName: project.status.name, backlogOption: option(project.status, config.statuses?.Backlog ?? 'Backlog'),
    statusOptions: Object.fromEntries(project.status.options.map(o => [o.id, o.name])),
    blockedField: project.blocked.id, blockedName: project.blocked.name, blockedOption: option(project.blocked, spec.blocked) };
}
// Search is index-delayed; the recent-issue list is consistent and catches an issue created seconds ago.
function duplicateCandidates(spec, api) {
  const found = new Map();
  const add = i => { if (!i.pull_request) found.set(i.number, { number: i.number, title: i.title, state: i.state, url: i.html_url }); };
  const recent = api(['api', `repos/${spec.repository}/issues?state=all&sort=created&direction=desc&per_page=100`]);
  if (!Array.isArray(recent)) throw new Error('Recent issue list unavailable; no issue will be created.');
  recent.filter(i => normalTitle(i.title) === normalTitle(spec.title)).forEach(add);
  // Plain words only: operators, exclusions, qualifiers and grouping would change the query.
  const words = (spec.title.match(/[\p{L}\p{N}]+/gu) ?? []).filter(w => !['AND', 'OR', 'NOT'].includes(w));
  if (words.length) {
    const pages = api(['api', '--paginate', '--slurp', '-X', 'GET', 'search/issues', '-f', `q=repo:${spec.repository} is:issue in:title ${words.join(' ')}`, '-f', 'per_page=100']);
    if (!Array.isArray(pages) || pages.some(p => !Array.isArray(p?.items))) throw new Error('Duplicate search unavailable; no issue will be created.');
    if (pages.some(p => p.incomplete_results) || pages.flatMap(p => p.items).length < (pages[0]?.total_count ?? 0)) throw new Error('Duplicate search returned incomplete results; retry later or use a more specific title.');
    pages.flatMap(p => p.items).forEach(add);
  }
  return [...found.values()].sort((a, b) => a.number - b.number);
}
export function previewIssue(config, spec, { api = ghJson } = {}) {
  const tracking = trackingPlan(config, spec, api);
  const [owner, name] = spec.repository.split('/');
  if (spec.labels?.length) {
    const pages = api(['api', '--paginate', '--slurp', `repos/${spec.repository}/labels?per_page=100`]);
    if (!Array.isArray(pages) || !pages.every(Array.isArray)) throw new Error('Unexpected label-list response.');
    const known = new Set(pages.flat().map(l => l.name));
    const unknown = spec.labels.filter(l => !known.has(l));
    if (unknown.length) throw new Error(`Unknown labels: ${unknown.join(', ')}`);
  }
  if (spec.type) {
    const available = graph(api, 'query($owner:String!,$name:String!){repository(owner:$owner,name:$name){issueTypes(first:25){nodes{name}}}}', { owner, name }).repository?.issueTypes?.nodes?.map(t => t.name) ?? [];
    if (!available.includes(spec.type)) throw new Error(`Issue type unavailable in ${spec.repository}: ${spec.type}`);
  }
  const duplicates = duplicateCandidates(spec, api);
  const unreviewed = duplicates.filter(d => !(spec.reviewedDuplicates ?? []).includes(d.number));
  const plan = { spec, ...tracking, duplicates: duplicates.map(d => d.number) };
  return { mode: 'preview', repository: spec.repository, title: spec.title, type: spec.type ?? null, labels: spec.labels ?? [], blocked: spec.blocked,
    project: tracking.project, duplicates, unreviewedDuplicates: unreviewed.map(d => d.number), fingerprint: hash(plan), plan,
    next: unreviewed.length ? 'Review the duplicates with the human; add accepted non-duplicates to reviewedDuplicates and preview again.' : 'After human approval of this exact preview, run with --apply --expect FINGERPRINT.' };
}
function track(config, spec, plan, issue, api) {
  const reference = `${spec.repository}#${issue.number}`, done = [];
  try {
    const item = enrollItem(api, plan.projectId, issue.node_id); done.push('enrolled');
    // The added-to-Backlog workflow usually sets Status; fill it only when still empty.
    if (!readSingleSelect(api, item, plan.statusName)) { setSingleSelect(api, plan.projectId, item, plan.statusField, plan.backlogOption); done.push('status set'); }
    if (readSingleSelect(api, item, plan.blockedName) !== plan.blockedOption) { setSingleSelect(api, plan.projectId, item, plan.blockedField, plan.blockedOption); done.push('blocked set'); }
    const status = readSingleSelect(api, item, plan.statusName), blocked = readSingleSelect(api, item, plan.blockedName);
    if (!status || blocked !== plan.blockedOption) throw new Error('Status/Blocked readback mismatch.');
    return { mode: 'apply', reference, url: issue.html_url, item, status: plan.statusOptions[status] ?? status, blocked: spec.blocked };
  } catch (error) {
    throw new Error(`${reference} exists (${issue.html_url}) but project tracking is incomplete after [${done.join(', ') || 'nothing'}]: ${error.message} Do not create it again; rerun with the same --spec and --config plus --resume ${issue.number}.`);
  }
}
export function applyIssue(config, spec, { api = ghJson, expect, resume, log = () => {} } = {}) {
  if (resume !== undefined) {
    // Finish tracking for an issue this spec already created; never creates.
    const plan = trackingPlan(config, spec, api);
    const issue = api(['api', `repos/${spec.repository}/issues/${resume}`]);
    if (!issue?.node_id || issue.pull_request || normalTitle(issue.title) !== normalTitle(spec.title)) throw new Error(`Issue ${spec.repository}#${resume} does not match this spec; nothing changed.`);
    return track(config, spec, plan, issue, api);
  }
  const preview = previewIssue(config, spec, { api });
  if (!expect || preview.fingerprint !== expect) throw new Error('Spec, project or duplicates changed since the approved preview; preview again and re-confirm. No issue created.');
  if (preview.unreviewedDuplicates.length) throw new Error(`Unreviewed duplicate candidates: ${preview.unreviewedDuplicates.join(', ')}. No issue created.`);
  const args = ['api', '-X', 'POST', `repos/${spec.repository}/issues`, '-f', `title=${spec.title}`, '-f', `body=${spec.body}`];
  if (spec.type) args.push('-f', `type=${spec.type}`);
  for (const label of spec.labels ?? []) args.push('-f', 'labels[]=' + label);
  let created;
  try { created = api(args); }
  catch (error) { throw new Error(`Issue creation outcome unknown: ${error.message} Do not rerun --apply. Preview again: an issue created by this attempt appears as an exact-title duplicate; then finish it with --resume NUMBER.`); }
  if (!created?.number || !created?.node_id) throw new Error('Issue creation result missing; preview again to find an exact-title match before any retry.');
  log({ created: `${spec.repository}#${created.number}`, url: created.html_url });
  return track(config, spec, preview.plan, created, api);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    let root = process.cwd(), config, spec, apply = false, expect, resume;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--apply') apply = true;
      else if (['--root', '--config', '--spec', '--expect', '--resume'].includes(args[i]) && args[i + 1]) {
        const key = args[i++], value = args[i];
        if (key === '--root') root = path.resolve(value);
        if (key === '--config') config = value;
        if (key === '--spec') spec = JSON.parse(readFileSync(value, 'utf8'));
        if (key === '--expect') expect = value;
        if (key === '--resume') { if (!/^[1-9]\d*$/.test(value)) throw new Error('--resume takes an issue number.'); resume = Number(value); }
      } else throw new Error('Use --spec FILE [--root PATH] [--config RELATIVE]; after approval --apply --expect FINGERPRINT; to finish tracking --resume NUMBER.');
    }
    if (!spec) throw new Error('Provide --spec FILE.');
    const tracking = loadTracking(root, config);
    const result = apply || resume !== undefined ? applyIssue(tracking, spec, { expect, resume, log: value => console.error(JSON.stringify(value)) }) : previewIssue(tracking, spec);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
