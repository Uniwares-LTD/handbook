import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function ghJson(args) {
  try { return JSON.parse(execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 })); }
  catch { throw new Error('GitHub request failed. Check local gh authentication, repository/Projects access, and connectivity; inspect remote state before retrying a write.'); }
}
export function graph(api, query, variables = {}) {
  const args = ['api', 'graphql', '-f', `query=${query}`];
  for (const [key, value] of Object.entries(variables)) if (value !== null && value !== undefined) args.push('-f', `${key}=${value}`);
  const result = api(args);
  if (result.errors?.length || !result.data) throw new Error('GitHub GraphQL returned errors; no successful result assumed.');
  return result.data;
}
export function reconcile(config, { api = ghJson, apply = [], log = () => {} } = {}) {
  if (!Number.isSafeInteger(config.number) || config.number < 1 || !config.url) throw new Error('Project identity is not configured.');
  const projectId = config.id || graph(api, `query($owner:String!){organization(login:$owner){projectV2(number:${config.number}){id}}}`, { owner: config.organization }).organization?.projectV2?.id;
  if (!projectId) throw new Error('Configured project could not be resolved.');
  const allowed = new Set(config.repositories);
  const requested = [...new Set(apply)];
  for (const ref of requested) if (!/^Uniwares-LTD\/[\w.-]+#[1-9]\d*$/.test(ref) || !allowed.has(ref.split('#')[0])) throw new Error(`Unenrolled or invalid issue reference: ${ref}`);
  const items = new Set();
  let cursor;
  do {
    const data = graph(api, `query($id:ID!,$cursor:String){node(id:$id){... on ProjectV2{id title owner{... on Organization{login}} items(first:100,after:$cursor){nodes{content{... on Issue{id}}} pageInfo{hasNextPage endCursor}}}}}`, { id: projectId, cursor });
    if (!data.node || data.node.owner?.login !== config.organization || data.node.title !== config.title) throw new Error('Project identity does not match configuration.');
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
    const data = graph(api, 'mutation($project:ID!,$content:ID!){addProjectV2ItemById(input:{projectId:$project,contentId:$content}){item{id}}}', { project: projectId, content: issue.id });
    if (!data.addProjectV2ItemById?.item?.id) throw new Error('Enrollment result missing; inspect project before retrying.');
    items.add(issue.id); added.push(ref); log({ added: ref, item: data.addProjectV2ItemById.item.id });
  }
  return { mode: requested.length ? 'apply' : 'report', missing, added, skipped };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), apply = [];
    for (let i = 0; i < args.length; i += 2) {
      if (args[i] !== '--apply' || !args[i + 1]) throw new Error('Usage: node scripts/enroll.mjs [--apply Uniwares-LTD/repository#number]');
      apply.push(args[i + 1]);
    }
    const config = JSON.parse(readFileSync(new URL('../project.json', import.meta.url), 'utf8'));
    console.log(JSON.stringify(reconcile(config, { apply, log: result => console.log(JSON.stringify(result)) }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
