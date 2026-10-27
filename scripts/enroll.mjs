import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTracking, validateTracking } from './tracking-config.mjs';

export function ghJson(args) {
  try { return JSON.parse(execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000, maxBuffer: 32 * 1024 * 1024, windowsHide: true })); }
  catch { throw new Error('GitHub request failed. Check local gh authentication, repository/Projects access, and connectivity; inspect remote state before retrying a write.'); }
}
export function graph(api, query, variables = {}) {
  const args = ['api', 'graphql', '-f', `query=${query}`];
  for (const [key, value] of Object.entries(variables)) if (value !== null && value !== undefined) args.push('-f', `${key}=${value}`);
  const result = api(args);
  if (result.errors?.length || !result.data) throw new Error('GitHub GraphQL returned errors; no successful result assumed.');
  return result.data;
}
export function projectIdOf(config, api = ghJson) {
  if (!Number.isSafeInteger(config.number) || config.number < 1 || !config.url) throw new Error('Project identity is not configured.');
  const projectId = config.id || graph(api, `query($owner:String!){organization(login:$owner){projectV2(number:${config.number}){id}}}`, { owner: config.organization }).organization?.projectV2?.id;
  if (!projectId) throw new Error('Configured project could not be resolved.');
  return projectId;
}
// Adding existing content returns its current item, so callers may run this after auto-add.
export function enrollItem(api, projectId, contentId) {
  const data = graph(api, 'mutation($project:ID!,$content:ID!){addProjectV2ItemById(input:{projectId:$project,contentId:$content}){item{id}}}', { project: projectId, content: contentId });
  const item = data.addProjectV2ItemById?.item?.id;
  if (!item) throw new Error('Enrollment result missing; inspect project before retrying.');
  const confirmed = graph(api, 'query($id:ID!){node(id:$id){... on ProjectV2Item{project{id} content{... on Issue{id}}}}}', { id: item }).node;
  if (confirmed?.project?.id !== projectId || confirmed?.content?.id !== contentId) throw new Error('Enrollment readback mismatch; inspect remote state before retrying.');
  return item;
}
export function readSingleSelect(api, itemId, fieldName) {
  return graph(api, 'query($id:ID!,$name:String!){node(id:$id){... on ProjectV2Item{fieldValueByName(name:$name){... on ProjectV2ItemFieldSingleSelectValue{optionId}}}}}', { id: itemId, name: fieldName }).node?.fieldValueByName?.optionId ?? null;
}
export function setSingleSelect(api, projectId, itemId, fieldId, optionId) {
  graph(api, 'mutation($project:ID!,$item:ID!,$field:ID!,$option:String!){updateProjectV2ItemFieldValue(input:{projectId:$project,itemId:$item,fieldId:$field,value:{singleSelectOptionId:$option}}){projectV2Item{id}}}', { project: projectId, item: itemId, field: fieldId, option: optionId });
}
export function reconcile(config,{ api = ghJson, apply = [], log = () => {} } = {}) {
  validateTracking(config);
  const projectId = projectIdOf(config, api);
  const allowed = new Set(config.repositories);
  const requested = [...new Set(apply)];
  for (const ref of requested) if (!/^[A-Za-z0-9-]+\/[\w.-]+#[1-9]\d*$/.test(ref) || !allowed.has(ref.split('#')[0])) throw new Error(`Unenrolled or invalid issue reference: ${ref}`);
  const items = new Set();
  let cursor;
  do {
    const data = graph(api, `query($id:ID!,$cursor:String){node(id:$id){... on ProjectV2{id number title owner{... on Organization{login}} items(first:100,after:$cursor){nodes{content{... on Issue{id}}} pageInfo{hasNextPage endCursor}}}}}`, { id: projectId, cursor });
    if (!data.node || data.node.number !== config.number || data.node.owner?.login?.toLowerCase() !== config.organization.toLowerCase()) throw new Error('Project identity does not match configuration.');
    for (const item of data.node.items.nodes) if (item.content?.id) items.add(item.content.id);
    cursor = data.node.items.pageInfo.hasNextPage ? data.node.items.pageInfo.endCursor : undefined;
  } while (cursor);
  const issues = new Map();
  for (const repository of allowed) {
    const pages = api(['api', '--paginate', '--slurp', `repos/${repository}/issues?state=open&per_page=100`]);
    if (!Array.isArray(pages) || !pages.every(Array.isArray)) throw new Error('Unexpected issue-list response.');
    for (const issue of pages.flat()) if (!issue.pull_request) issues.set(`${repository}#${issue.number}`, { id: issue.node_id, title: issue.title });
  }
  // Validate the entire explicit selection before the first write.
  for (const ref of requested) if (!issues.has(ref)) throw new Error(`Selected issue is not an accessible open issue: ${ref}`);
  const missing = [...issues].filter(([, issue]) => !items.has(issue.id)).map(([reference, issue]) => ({ reference, title: issue.title }));
  const added = [], skipped = [];
  for (const ref of requested) {
    const issue = issues.get(ref);
    if (items.has(issue.id)) { skipped.push(ref); continue; }
    const item = enrollItem(api, projectId, issue.id);
    items.add(issue.id); added.push(ref); log({ added: ref, item });
  }
  return { mode: requested.length ? 'apply' : 'report', missing, added, skipped };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), apply = [];
    let root = process.cwd(), explicit;
    for (let i = 0; i < args.length; i += 2) {
      if (!args[i + 1]) throw new Error('Missing option value.');
      if (args[i] === '--apply') apply.push(args[i + 1]);
      else if (args[i] === '--root') root = path.resolve(args[i + 1]);
      else if (args[i] === '--config') explicit = args[i + 1];
      else throw new Error('Usage: enroll.mjs [--root CONSUMER] [--config RELATIVE] [--apply OWNER/REPO#NUMBER]');
    }
    const config = loadTracking(root, explicit);
    console.log(JSON.stringify(reconcile(config, { apply, log: result => console.log(JSON.stringify(result)) }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
